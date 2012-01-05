<?php 
class CfgSource {
	protected $params;
	function getParam($name, $def = false)
	{
		if(!isset($this->params[$name])) return $def;
		return $this->params[$name];
	}
	function load($path)
	{
		$this->params = require_once($path);
	}
}