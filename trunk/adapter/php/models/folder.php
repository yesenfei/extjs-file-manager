<?php
class FolderModel extends BasefileModel
{
	public $type = 'folder';
	public $cls = 'folder';
	public $text;
	function __construct($dir, $name, $options)
	{
		parent::__construct($dir, $name, $options);
		$this->text = $this->name;
	}
	public function getChildren($isInfo = true, $isHidden = true)
	{
		return BasefileModel::findByDir($this->dir.'/'.$this->name,$isInfo, $isHidden);
	}
	public function upload($file, $name = '')
	{
		if(!$name) $name = $file['name'];
		$path = $this->getPath().'/'.$name;
		if(move_uploaded_file($file['tmp_name'],$path))
		{
			
			return true;
		}
		return false;
	}
	public function remove()
	{
		$children = $this->getChildren(false,false);
		foreach($children as $item){
			$item->remove();
		}
		rmdir($this->getPath());
	}
	/**
	* Копирует директорию
	*/
	public function copyTo($target)
	{
		$path = Lib::gpath($target) . '/' . $this->name;
		if($path != $this->getPath())
		{
			if(mkdir($path))
			{
				foreach($this->getChildren(false,false) as $file){
					if(!$file->copyTo($target.'/'.$this->name)) return false;
				}
			}
		}
		return true;
	}
	/**
	* Переносит директорию
	*/
	public function moveTo($target)
	{
		$target = Lib::gpath($target);
		return rename($this->getPath(), $target.'/'.$this->name);
	}
	static function findByDir($dir='', $isHidden = true)
	{
		$hidden = false;
		if($isHidden){
			$hidden = Cfg::get('hidden',false);
		}
		$dir = ltrim($dir, '/');
		$path = Lib::gpath($dir);
		$res = array();
		$d = opendir($path);
		if($d)
		{
			while(($e = readdir($d))!==false)
			{
				if($e=='.' || $e=='..')continue;
				if(is_dir($path.'/'.$e) && !($hidden && preg_match($hidden,$e)))
				{
					$res[] = new self($dir,$e, array());
				}
			}
		}
		return $res;
	}
	static function mkdir($path, $name, $mode = false)
	{
		$path = trim($path,' /\\');
		$pachFolder =  Cfg::get('baseDir').'/'.$path;
		$mode = intval( Cfg::get('mkdirmode',0666,$mode),8);
		if(mkdir($pachFolder.'/'.$name, $mode))
		{
			chmod($pachFolder.'/'.$name, $mode);
			return BasefileModel::createFromPathAndName($path,$name);
		}
		return false;
	}
}
