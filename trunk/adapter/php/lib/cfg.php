<?php 
require('lib/cfgsource.php');
class Cfg {
	static private $instance;
	private $source;
	private function __construct()
	{
		$this->source = new CfgSource;
	}
	static function instance()
	{
		if(!cfg::$instance) cfg::$instance = new cfg();
		return cfg::$instance;
	}
	static function init($path,$source = false)
	{
		$inst = self::instance();
		if($source) $inst->source = $source;
		$inst->source->load($path);
	}
	static function get($name, $def = false, $value = false)
	{
		if($value) return $value;
		$inst = self::instance();
		return $inst->source->getParam($name, $def);
	}
}