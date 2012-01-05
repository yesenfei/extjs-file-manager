<?php
session_start();
putenv('TMPDIR='.ini_get('upload_tmp_dir') );
require_once('lib/exceptionizer.php');
require_once('lib/request.php');
require_once('lib/application_controller.php');
require_once('lib/response.php');
require_once('lib/cfg.php');
require_once('lib/yamlcfgsource.php');
function __autoload($name)
{
	if(strpos($name,'Model') !== false)
	{
		$path = 'models/'.strtolower(str_replace('Model','',$name)).'.php';
		require_once $path;
	} else {
		$path = 'lib/'.strtolower($name).'.php';
		require_once $path;
	}
}
Cfg::init('../../config/config.yaml',new YamlCfgSource);
$directory = 'locale';
$domain = 'messages';
$locale = Cfg::get('lang','en_EN');
// Задаем текущий язык проекта
putenv("LANG=".$locale);
// Задаем текущую локаль (кодировку)
setlocale (LC_ALL,$locale);
// Задаем каталог домена, где содержатся переводы
if(function_exists('bindtextdomain'))
{
	bindtextdomain ($domain, $directory);
	textdomain ($domain);
	bind_textdomain_codeset($domain, Cfg::get('charset','UTF-8'));
} else {
	function gettext($text){
		return $text;
	}
}
Log::debug('=====================================================================================================================================================');
Log::timer('app');
// Get Request
$request = new Request(array('restful' => false));

// Get Controller
require('controllers/' . $request->controller . '.php');
$controller_name = ucfirst($request->controller).'Controller';
$controller = new $controller_name;
$ex = new PHP_Exceptionizer(E_ALL);
// Dispatch request
$response = $controller->dispatch($request);
if($response){
	$response->send();
}
Log::timerEnd('app');

