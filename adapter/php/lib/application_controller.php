<?php
/**
 * @class ApplicationController
 */
class ApplicationController {
	public $request, $id, $params;

	/**
	 * dispatch
	 * Dispatch request to appropriate controller-action by convention according to the HTTP method.
	 */
	public function dispatch($request) {
		try {
			$this->request = $request;
			$this->id = $request->id;
			$this->params = $request->params;
			
			if ($request->isRestful()) {
				return $this->dispatchRestful();
			}
			if ($request->action) {
				return $this->{$request->action}();
			}
			else
			{
				return $this->index();
			}
		} catch(Exception $ex) {
			Log::exception($ex);
			return new Response(false,false,gettext("Ошибка на сервере пробуйте позже."));
		}
	}

	protected function dispatchRestful() {
		switch ($this->request->method) {
			case 'GET':
				return $this->view();
				break;
			case 'POST':
				return $this->create();
				break;
			case 'PUT':
				return $this->update();
				break;
			case 'DELETE':
				return $this->destroy();
				break;
		}
	}
}

