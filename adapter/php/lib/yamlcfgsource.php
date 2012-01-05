<?php
require_once('lib/cfgsource.php');
require_once('lib/spyc.php');
class YamlCfgSource extends CfgSource
{
	function load($path)
	{
		$this->params = Spyc::YAMLLoad($path);
	}
}