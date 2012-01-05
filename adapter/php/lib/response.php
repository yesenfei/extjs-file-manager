<?php
/**
 * @class Response
 * A simple JSON Response class.
 */
class Response {
	public $success, $data, $message, $errors, $tid, $trace,$resultdata;

	public function __construct($data, $success = true, $message = '', $resultdata = true) {
		$this->success  = $success;
		$this->message  = $message;
		$this->data     = $data;
		$this->resultdata = $resultdata;
	}
	public function to_json() {
		if($this->resultdata) {
			return json_encode(Lib::code(array(
				'success'   => $this->success,
				'message'   => $this->message,
				'data'      => $this->data
			)));
		} else {
			return json_encode(Lib::code($this->data));
		}
	}
	
	public function send()
	{
		echo $this->to_json();
	}
}
