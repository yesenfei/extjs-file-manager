<?php
class FileModel extends BasefileModel
{
	public $lastmod;
	public $size;
	public function initInfo()
	{
		parent::initInfo();
		$path = Cfg::get('baseDir').$this->id;
		Log::debug($path);
		$this->lastmod = @filemtime($path);
		$this->size =  sprintf("%u", filesize($path));
		if($this->type != 'folder')
		{
			$pos = strrpos($this->name, ".");
			if($pos)
			{
				$this->cls = substr($this->name,$pos+1);
				$this->type = $this->getTypeFromExp($this->cls);
			}
		}
	}
	/**
	* Удаляет файл
	*/
	public function remove()
	{
		@unlink($this->getPath());
	}
	/**
	* Копирует файл в директорию target
	*/
	public function copyTo($target)
	{
		$target = Lib::gpath($target);
		return copy($this->getPath(), $target.'/'.$this->name);
	}
	/**
	* Переносит файл в директорию target
	*/
	public function moveTo($target)
	{
		$target = Lib::gpath($target);
		return rename($this->getPath(), $target.'/'.$this->name);
	}
	/**
	* Получить содержимое файла
	*/
	public function getContent(){
		return file_get_contents($this->getPath());
	}
	/**
	* Возвращает время изменения индексного дескриптора (inode) файла.
	*/
	public function ctime(){
		return  filectime ($this->getPath());
	}
	public function filename(){
		$pos = strrpos($this->name, ".");
		if($pos)
		{
			return substr($this->name,0, $pos);
		}
		return $this->name;
	}
}