<?php
class Log
{
	const ERROR 	= 1;
	const WARNING 	= 2;
	const INFO 		= 4;
	const DEBUG 	= 8;
	private $level;
	private $dir;
	private static $timers = array();
	private static $instance;
	private function __construct(){
		$levels = Cfg::get('log_level');
		if($levels)
		{
			$levels = explode('|',$levels);
			$values = array(
				'error'		=> self::ERROR,
				'warning'	=> self::WARNING,
				'info'		=> self::INFO,
				'debug'		=> self::DEBUG,
			);
			$this->level = 0;
			foreach($levels as $v){
				$v = trim($v);
				$this->level |= $values{$v};
			}
		}
		$this->dir = Cfg::get('log_dir',dirname(__FILE__).'/../log');
		//$this->_write(date('d.m.Y H:i'));
	}
	static function timer($name)
	{
		if(self::inst()->level & self::DEBUG){
			self::$timers[$name] = microtime();
		}
	}
	static function timerEnd($name)
	{
		if(isset(self::$timers[$name]))
		{
			$time = microtime() - self::$timers[$name];
			$str = "Timer {$name}:{$time}us";
			self::debug($str);
			return $str;
		}
		return false;
	}
	public function inst()
	{
		if(!self::$instance) self::$instance = new self;
		return self::$instance;
	}
	protected function _write($msg,$level)
	{
		if($level && $this->level & $level)
		{
			$filepath = $this->dir.'/'.date('Y_m_d').'.log';
			if ($fp = @fopen($filepath, 'a'))
			{
				flock($fp, LOCK_EX);	
				fwrite($fp, $msg."\n");
				fclose($fp);
				return true;
			}
			return false;
		}
		return true;
	}
	static function exception($ex, $level = self::ERROR)
	{
		self::inst()->_write("ERROR({$ex->getFile()}:{$ex->getLine()}): {$ex->getMessage()}",self::ERROR);
	}
	static function error($msg)
	{
		self::inst()->_write('ERROR: '.$msg,self::ERROR);
	}
	static function warn($msg)
	{
		self::inst()->_write('WARNING: '.$msg,self::WARNING);
	}
	static function info($msg)
	{
		self::inst()->_write($msg,self::INFO);
	}
	static function debug($msg)
	{
		if(self::inst()->level & self::DEBUG)
		{
			if(is_array($msg) || is_object($msg)){
				$msg = print_r($msg,true);
			}
			self::inst()->_write($msg,self::DEBUG);
		}
	}
	static function write($msg,$level = false)
	{
		self::inst()->_write($msg,$level);
	}
}