<?php
class FilesController extends ApplicationController {
	
	public function index()
	{
		try {
			$data = BasefileModel::findByDir(str_replace('root','',$this->params->dir));
			return new Response($data);
		} catch(Exception $ex) {
			Log::exception($ex);
			return new ResponseError(gettext("Не возможно открыть директорию ").$this->params->dir);
		}
	}
	public function getChildFolderTree()
	{
		try {
			return new Response(FolderModel::findByDir(str_replace('root','',$this->params->dir)),true,'',false);
		} catch(Exception $ex) {
			Log::exception($ex);
			$msg = gettext("Не возможно открыть директорию ").$this->params->dir;
			return new ResponseError($msg);
		}
	}
	/*function getChildTree()
	{
		return new Response(FolderModel::findByDir(str_replace('root','',$this->params->node)));
	}*/
	public function exists($mode = false)
	{
		//echo Lib::isWrite($this->params->dir);
		try {
			$file = BasefileModel::createFromPathAndName($this->params->dir,$this->params->name, false);
			
			return new Response($file?true:false);
		} catch(Exception $ex) {
			Log::exception($ex);
			return new ResponseError($ex->getMessage());
		}
	}
	public function preview()
	{
		try {
			$file = BasefileModel::createFromPath($this->id);
			if($file) {
				if($file->type == 'image'){
					$thumb = BasefileModel::createFromPath($file->getThumb(intval($this->params->width),intval($this->params->height),intval($this->params->mode)));
					if($thumb){
						return new ResponseImage($thumb);
					} else {
						Log::warn("Not finde image {$this->id} thumb");
					}
				} else {
					Log::error("File {$this->id} not image type");
				}
			} else {
				Log::warn("Not finde image ".$this->id);
			}
		} catch(Exception $ex) {
			Log::exception($ex);
		}
		header("HTTP/1.0 404 Not Found");  
		exit(); 
	}
	protected function arhiveRecursive($zip,$folder,$zipPath) {
		foreach($folder->getChildren(false) as $file)
		{
			$newZipPath = $zipPath.'/'.$file->name;
			if($file->type == 'folder'){
				$this->arhiveRecursive($zip,$file,$newZipPath);
			} else {
				$zip->addLargeFile($file->getPath(), Lib::convert($newZipPath,Cfg::get('charset'),Cfg::get('charsetZip')));
			}
		}
	}
	public function arhive(){
		try {
			$zip = new Zip();
			$res = array();
			foreach($this->params->files as $n)
			{
				$file = BasefileModel::createFromPath($n,false);
				if($file->type == 'folder'){
					$this->arhiveRecursive($zip, $file, $file->name);
				} else {
					$zip->addFile($file->getContent(), Lib::convert($file->name,Cfg::get('charset'),Cfg::get('charsetZip')), $file->ctime());
				}
				$res[] = $file;
			}
			$c = count($res);
			$name = 'arhive.zip';
			if($c == 1){
				$name = $res[0]->filename().'.zip';
			}
			$zip->sendZip($name);
			exit;
		} catch(Exception $ex) {
			Log::exception($ex);
			echo gettext('Не возможно получить архив');
		}
		exit(); 
	}
	public function getInfo()
	{
		$file = BasefileModel::createFromPath($this->params->path);
		if($file){
			return new Response($file->getExtInfo());
		} else {
			return new Response($file,false,gettext("Фаил не найден"));
		}
	}
	public function permission()
	{
		
		
	}
	public function copy()
	{
		try {
			foreach($this->params->files as $path){
				$file = BasefileModel::createFromPath($path);
				if($file){
					if(!$file->copyTo($this->params->target)){
						return new ResponseError(gettext("Не удалось скопировать файлы."));
					}
				}
			}
			$data = BasefileModel::findByDir($this->params->target);
			return new Response($data);
		}  catch(Exception $ex) {
			Log::exception($ex);
		}
		return new ResponseError(gettext("Не удалось скопировать файлы."));
	}
	public function cut()
	{
		try {
			foreach($this->params->files as $path){
				$file = BasefileModel::createFromPath($path);
				if($file){
					if(!$file->moveTo($this->params->target)){
						return new ResponseError(gettext("Не удалось перенести файлы."));
					}
				}
			}
			$data = BasefileModel::findByDir($this->params->target);
			return new Response($data);
		}  catch(Exception $ex) {
			Log::exception($ex);
		}
		return new ResponseError(gettext("Не удалось перенести файлы."));
	}
	public function rename()
	{
		$file = BasefileModel::createFromPath($this->params->path);
		if($file){
			if($file->rename($this->params->name)){
				return new Response($file);
			} else {
				return new ResponseError(gettext("Не удалось переименовать."));
			}
		} else {
			return new ResponseError(gettext("Фаил не найден"));
		}
	}
	public function newfolder()
	{
		$file = BasefileModel::createFromPathAndName($this->params->path,$this->params->name);
		if(!$file) {
			$folder = FolderModel::mkdir($this->params->path,$this->params->name);
			if($folder)
			{
				$folder->initInfo();
				return new Response($folder);
			} else {
				return new ResponseError(gettext("Не удалось создать папку."),$file);
			}
		} else {
			return new ResponseError(gettext("Папка с таким именем уже существует."),$file);
		}
	}
	public function remove()
	{
		$res = array();
		foreach($this->params->files as $path)
		{
			$file = BasefileModel::createFromPath($path,false);
			if($file){
				$res[] = $file;
				$file->remove();
			}
		}
		return new Response($res);
	}
	public function upload(){
		try {
			$folder = BasefileModel::createFromPath($this->params->dir);
			if($folder) {
				if($_FILES['file']['error'] == 0)
				{
					if($folder->upload($_FILES['file'],$this->params->name))
					{
						
						return new Response($folder->getChildren());
					}
					else
					{
						return new ResponseError(gettext("Не удалось загрузить файл."));
					}
				} else {
					switch($_FILES['file']['error'])
					{
						case UPLOAD_ERR_INI_SIZE:
						case UPLOAD_ERR_FORM_SIZE:
							return new ResponseError(gettext("Размер принятого файла превысил максимально допустимый размер."));
						case UPLOAD_ERR_PARTIAL: return new ResponseError(gettext("Загружаемый файл был получен только частично."));
						case UPLOAD_ERR_NO_FILE: return new ResponseError(gettext("Не удалось загрузить файл."));
					}
				}
			} else {
				return new ResponseError(gettext("Не найдена директория."));
			}
		} catch(Exception $ex) {
			Log::exception($ex);
			return new ResponseError(gettext("Не возможно загрузить в эту директорию."));
		}
	}
}
