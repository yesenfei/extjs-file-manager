<?php

/**
 * @class Request
 */
class Request {
	public $restful, $method, $controller, $action, $id, $params;

	public function __construct($params) {
		$this->restful = (isset($params["restful"])) ? $params["restful"] : false;
		$this->method = $_SERVER["REQUEST_METHOD"];
		$this->parseRequest();
	}
	public function isRestful() {
		return $this->restful;
	}
	protected function parseRequest() {
		if ($this->method == 'PUT') {   // <-- Have to jump through hoops to get PUT data
			$raw  = '';
			$httpContent = fopen('php://input', 'r');
			while ($kb = fread($httpContent, 1024)) {
				$raw .= $kb;
			}
			fclose($httpContent);
			$params = array();
			parse_str($raw, $params);

			if (isset($params['data'])) {
				$this->params =  json_decode(stripslashes($params['data']));
			} else {
				$params = json_decode(stripslashes($raw));
				$this->params = $params->data;
			}
		} else {
			// grab JSON data if there...
			if(isset($_REQUEST['data']))
			{
				$this->params =  json_decode(stripslashes($_REQUEST['data']));
			} else {
				$this->params = json_decode('{}');
				foreach($_REQUEST as $n=>$v)
				{
					$this->params->$n = $v;
				}
			}
			/*if (isset($_REQUEST['data'])) {
				$this->params =  json_decode(stripslashes($_REQUEST['data']));
			} else {
				$raw  = '';
				$httpContent = fopen('php://input', 'r');
				while ($kb = fread($httpContent, 1024)) {
					$raw .= $kb;
				}
				$params = json_decode(stripslashes($raw));
				$this->params = $params->data;
			}*/

		}
		
		$this->params = Lib::decode($this->params);
		// Quickndirty PATH_INFO parser
		if (isset($_SERVER["PATH_INFO"])){
			$cai = '/^\/([a-z]+\w)\/([a-z]+\w)\/(.+)$/i';  // /controller/action/id
			$ca =  '/^\/([a-z]+\w)\/([a-z]+)$/i';              // /controller/action
			//$ci = '/^\/([a-z]+\w)\/([0-9]+)$/i';               // /controller/id
			$c =  '/^\/([a-z]+\w)$/i';                             // /controller
			$i =  '/^\/([0-9]+)$/i';                             // /id
			$matches = array();
			if (preg_match($cai, $_SERVER["PATH_INFO"], $matches)) {
				$this->controller = $matches[1];
				$this->action = $matches[2];
				$this->id = $matches[3];
			} else if (preg_match($ca, $_SERVER["PATH_INFO"], $matches)) {
				$this->controller = $matches[1];
				$this->action = $matches[2];
			} /*else if (preg_match($ci, $_SERVER["PATH_INFO"], $matches)) {
				$this->controller = $matches[1];
				$this->id = $matches[2];
			}*/ else if (preg_match($c, $_SERVER["PATH_INFO"], $matches)) {
				$this->controller = $matches[1];
			} else if (preg_match($i, $_SERVER["PATH_INFO"], $matches)) {
				$this->id = $matches[1];
			}
		}
		if($this->id){
			$this->id = Lib::decode($this->id);
		}
		
		Log::debug('Controller: '.$this->controller);
		Log::debug('Action: '.$this->action);
		Log::debug('Id: '.$this->id);
		Log::debug($this->params);
	}
}

