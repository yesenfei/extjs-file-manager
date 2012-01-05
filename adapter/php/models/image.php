<?php
class ImageModel extends FileModel
{
	public $width;
	public $height;
	public $preview;
	public $mime;
	public function initInfo()
	{
		parent::initInfo();
		$info = getimagesize($this->getPath());
		$this->width = $info[0];
		$this->height = $info[1];
		$this->mime = $info['mime'];
	}
	public function getThumb($width,$height,$mode)
	{
		Log::debug("$width,$height");
		$dirThumb = "{$this->dir}/.thumbs/{$width}_{$height}_{$mode}";
		$pathThumb = $dirThumb.'/'.$this->name.'.jpg';
		if(!file_exists(Lib::gpath().$pathThumb)){
			$dir = Lib::gpath($dirThumb);
			if(!is_dir($dir)){
				if(!is_dir($this->getDir().'/.thumbs')){
					mkdir($this->getDir().'/.thumbs');
				}
				mkdir($dir);
			}
			$t = new Image_Toolbox($this->getPath());
			$t->newOutputSize($width, $height, $mode, false, '#FFFFFF');
			$t->save(Lib::gpath().$pathThumb, 'jpg', 80);
		}
		return $pathThumb;
	}
	public function deleteThumb()
	{
		$dirThumb = Lib::gpath()."{$this->dir}/.thumbs";
		if(is_dir($dirThumb))
		{
			$d = opendir($dirThumb);
			if($d)
			{
				while(($e = readdir($d))!==false)
				{
					if($e=='.' || $e=='..')continue;
					if(is_dir($dirThumb.'/'.$e))
					{
						$path = $dirThumb.'/'.$e.'/'.$this->name.'.jpg';
						if(is_file($path))
						{
							@unlink($path);
						}
					}
				}
			}
		}
	}
	public function rename($name)
	{
		$this->deleteThumb();
		return parent::rename($name);
	}
	public function remove()
	{
		$this->deleteThumb();
		return parent::remove();
	}
	public function moveTo($target)
	{
		$this->deleteThumb();
		return parent::moveTo($target);
	}
	public function getExtInfo(){
		$er = new phpExifReader($this->getPath());
		return $er->getImageInfo();
	}
}