<?php 
class BaseFileModel
{
	public $name;
	public $id;
	public $type = 'file';
	public $cls = 'file';
	public $size = 0;
	public $state;
	protected $dir;
	function __construct($dir, $name, $options = array())
	{
		foreach($options as $n=>$v)
		{
			if(isset($this->$n)){
				$this->$n = $v;
			}
		}
		$this->name = $name;
		Log::debug('dir');
		Log::debug($dir);
		$this->dir = trim($dir,' /\\');
		Log::debug($this->dir);
		if($this->dir != ''){
			$this->id = $this->dir.'/'.$name;
		} else {
			$this->id = $name;
		}
		if(strpos($this->id, '/') !== 0)
		{
			$this->id = '/'.$this->id;
		}
	}
	public function initInfo()
	{
		$this->state = Lib::stat($this->id);
	}
	public function getExtInfo(){
		return array();
	}
	public function getDir()
	{
		return Lib::gpath($this->dir);
	}
	public function getPath()
	{
		return $this->getDir().'/'.$this->name;
	}
	public function rename($name)
	{
		if($this->name != $name){
			$dir = $this->getDir();
			if(!rename($dir.'/'.$this->name,$dir.'/'.$name))
			{
				return false;
			}
			$this->name = $name;
			$this->id = $this->dir.'/'.$this->name;
		}
		return true;
	}
	public function remove()
	{
	}
	public function copyTo($target)
	{
		return true;
	}
	public function moveTo($target)
	{
		return true;
	}
	public function filename(){
		return $this->name;
	}
	/*
		block: block special device

		char: character special device

		dir: directory

		fifo: FIFO (named pipe)

		file: regular file

		link: symbolic link

		unknown: unknown file type
	*/
	static function createFromType($type, $pachFile,$name)
	{
		$types = Cfg::get('types', array());
		switch($type)
		{
			case 'dir':
				return new FolderModel($pachFile,$name,isset($types[$type])?$types[$type]:array());
			break;
			case 'file':
				$pos = strrpos($name, ".");
				if($pos)
				{
					$exp = substr($name,$pos+1);
					$type = self::getTypeFromExp($exp);
				}
				if(isset($types[$type]) && isset($types[$type]['cls']))
				{
					$cls = $types[$type]['cls'];
					return new $cls($pachFile,$name,$types[$type]);
				} 
				return new FileModel($pachFile,$name,isset($types[$type])?$types[$type]:array());
			break;
			default:
			break;
		}
		return null;
	}
	static function getTypeFromExp($exp)
	{
		$types = Cfg::get('types',array());
		foreach($types as $n=>$v)
		{
			$reg = "/^(".$v['exp'].")$/i";
			if(preg_match($reg,$exp)) return $n;
		}
		return 'file';
	}
	static function createFromPathAndName($path,$name, $info = true)
	{
		$pachFile =  Lib::gpath($path);
		if(file_exists($pachFile.'/'.$name)){
			$file = self::createFromType(filetype($pachFile.'/'.$name),$pachFile,$name);
			if($file && $info){
				$file->initInfo();
			}
			return $file;
		}
		return null;
	}
	static function createFromPath($path, $info = true)
	{
		$pachFile =  Lib::gpath($path);
		if(file_exists($pachFile)){
			$file = self::createFromType(filetype($pachFile),dirname($path),basename($path));
			if($file && $info){
				$file->initInfo();
			}
			return $file;
		}
		return null;
	}
	static function findByDir($dir, $isInfo = true, $isHidden = true)
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
			$files = array();
			while(($e = readdir($d))!==false)
			{
				if($e=='.' || $e=='..')continue;
				if($hidden == false || !preg_match($hidden,$e))
				{
					$file = BasefileModel::createFromPath($dir.'/'.$e, $isInfo);
					if($file)
					{
						if($file->type == 'folder'){
							$res[] = $file;
						} else {
							$files[] = $file;
						}
					}
				}
			}
			$res = array_merge($res,$files);
		}
		return $res;
	}
}