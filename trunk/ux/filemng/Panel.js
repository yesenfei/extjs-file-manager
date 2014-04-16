Ext.ns('Ext.ux.filemng');
Ext.ux.filemng.lang = {};
Ext.ux.filemng.t = function(text/*,...*/)
{
	if(Ext.ux.filemng.lang && text in Ext.ux.filemng.lang){
		text = Ext.ux.filemng.lang[text];
	}
	for(var i =1,l = arguments.length;i <l;++i)
	{
		text = text.replace('{'+i+'}',arguments[i]);
	}
	return text;
};
(function(){
	var t = Ext.ux.filemng.t;
	function box(html){
		return '<div class="x-box"><div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div><div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc">'+html+'</div></div></div><div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div></div>'
	}
	function imageLoader(img){

		var loader = new Image;
		loader.src = img.src;
		var wrap = Ext.get(img).parent();
		if(wrap) wrap.addCls('doloading');
		Ext.Function.defer(function(){
			if(loader.width == 0){
				if(wrap) {
					wrap.removeCls('doloading');
					wrap.addCls('loading');
				}
				Ext.get(loader).on('load',function(){
					img.src = loader.src;
					if(wrap) {
						wrap.removeCls('loading');
					}
					loader = null;
					wrap = null
				},this,{single:true});
			} else {
				loader = false;
			}
		},100);
	}
	Ext.ux.filemng.imagesLoader = function(block, q){
		if(Ext.isOpera == false){
			Ext.each(Ext.get(block).query(q || 'img'),imageLoader);
		}
	}
/*
 * Ext JS Library 4.1 File Manager
 * Copyright(c) 2011 Sergey Voronkov.
 * http://www.softcoder.ru
 */
Ext.define('Ext.ux.filemng.Panel', {
    extend: 'Ext.panel.Panel',
    requires: ['Ext.ux.filemng.ModelFile','Ext.ux.filemng.PathToolbar','Ext.ux.filemng.TreePanel','Ext.ux.filemng.ListView', 'Ext.ux.filemng.FileUploader'],
    alias: ['widget.filemng'],
	/**
	 * Базовый адрес для доступа к файлом из браузера
	 */
	baseUrl:'data',
	/**
	 * Адрес адаптера для работы с файлами
	 */
	urlAction:'adapter/php/index.php',
	cls:'x-filemng-panel',
	editNameSelector:'.file-name',
	layout:'border',
	enableHotkeys:true,
	newFolderName:t('Новая папка'),
	buttonsCfg:'refresh,|,addfolder,del,|,copy,cut,paste,|,rename,|,upload_file,|,toggle_tree,toggle_property,|,view_list,view_icon,|,->,find,wait',
	buttonsBar:{
		find:{
			xtype:'textfield',
			enableKeyEvents:true,
			emptyText:t('Поиск'),
			fieldCls:'search',
			width:200
		},
		wait:{xtype:'image',src: Ext.BLANK_IMAGE_URL, cls:'wait'},
		refresh:{
			iconCls:'b-refresh',
			tooltip:t('Обновить')+'(Ctrl+R)'
		},
		folderup:{
			iconCls:'b-up',
			tooltip:t('Выйти из папки')
		},
		undo:{
			iconCls:'b-undo',
			tooltip:t('Отмена')+'(Ctrl+Z)'
		},
		redo:{
			iconCls:'b-redo',
			tooltip:t('Повтор')+'(Ctrl+Y)'
		},
		addfolder: {
			iconCls:'b-addfolder',
			text:t('Новая папка'),
			tooltip:t('Создать новую папку в текущей директрии')
		},
		rename: {
			iconCls:'b-rename',
			text:t('Переименовать'),
			tooltip:t('Переименовать')+'(F2)'
		},
		del: {
			iconCls:'b-del',
			text:t('Удалить'),
			tooltip:t('Удалить')
		},
		toggle_tree: {
			iconCls:'b-toggle-tree',
			enableToggle:true,
			pressed:true,
			tooltip:t('Показать дерево папок')
		},
		toggle_property: {
			iconCls:'b-toggle-property',
			enableToggle:true,
			pressed:true,
			tooltip:t('Показать свойства')
		},
		upload_file: {
			xtype:'filemngupload',
		},
		copy:{
			iconCls:'b-copy-file',
			//text:t('Копировать'),
			tooltip:t('Копировать файл')
		},
		cut:{
			iconCls:'b-cut-file',
			tooltip:t('Вырезать файл')
		},
		paste:{
			iconCls:'b-paste-file',
			tooltip:t('Вставить файл')
		},
		view_list:{
			iconCls:'b-view-list',
			enableToggle:true,
			toggleGroup:'view',
			tooltip:t('Показать списком файлы')
		},
		view_icon:{
			iconCls:'b-view-icon',
			enableToggle:true,
			toggleGroup:'view',
			tooltip:t('Показать иконками файлы')
		}
	},
	hotkeys:[{
		key:'r',
		ctrl:true,
		cmd:'refresh',
		stopEvent:true
	},{
		key:'z',
		ctrl:true,
		cmd:'undo',
		stopEvent:true
	},{
		key:'y',
		ctrl:true,
		cmd:'redo',
		stopEvent:true
	},{
		key:Ext.EventObject.F2,
		cmd:'rename',
		stopEvent:true
	},{
		key:'x',
		ctrl:true,
		cmd:'cut',
		stopEvent:true
	},{
		key:'c',
		ctrl:true,
		cmd:'copy',
		stopEvent:true
	},{
		key:'v',
		ctrl:true,
		cmd:'paste',
		stopEvent:true
	},{
		key:'n',
		ctrl:true,
		cmd:'addfolder',
		stopEvent:true
	},{
		key:Ext.EventObject.DELETE,
		cmd:'del',
		stopEvent:true
	},{
		key:[Ext.EventObject.LEFT,Ext.EventObject.UP],
		cmd:'select_prev',
		stopEvent:true
	},{
		key:[Ext.EventObject.RIGHT,Ext.EventObject.DOWN],
		cmd:'select_next',
		stopEvent:true
	},{
		key:'a',
		cmd:'select_all',
		ctrl:true,
		stopEvent:true
	},{
		key:Ext.EventObject.ENTER,
		cmd:'open_selected',
		stopEvent:true
	},{
		key:Ext.EventObject.BACKSPACE,
		cmd:'up',
		stopEvent:true
	},{
		key:Ext.EventObject.LEFT,
		ctrl:true,
		cmd:'up',
		stopEvent:true
	}],

	// private
	initComponent:function(){
		var me = this;
		this.initTemplates();
		this.store = new Ext.data.Store({
			// store configs
			autoDestroy: true,
			model: 'Ext.ux.filemng.ModelFile',
			proxy: {
				type: 'ajax',
				url: this.action('files'),
				reader: {
					idProperty: 'id',
					messageProperty:"message",
					successProperty:'success',
					root: 'data',
				}
			},
		});
		this.pathBar = Ext.create('Ext.ux.filemng.PathToolbar');
		this.elements += ',x-filemng-bar-button';
		
		
		
		
		this.treePanel = Ext.create('Ext.ux.filemng.TreePanel', {
			minWidth:100,
			width:250,
			region:'west',
			border:false,
			store:Ext.create('Ext.data.TreeStore', {
				nodeParameter:'dir',
				proxy: {
					type: 'ajax',
					url: this.action('files','getChildFolderTree'),
					reader: {
						idProperty: 'id',
						messageProperty:"message",
						successProperty:'success',
						root: 'data',
					}
				},
			})
		});
		this.listView = Ext.create('Ext.ux.filemng.ListView', {
			store: this.store,
			multiSelect: true,
			reserveScrollOffset: true,
			autoScroll:false,
			baseUrl:this.baseUrl,
			fileMng:this,
			//plugins: [new DragSelector()]
		});
		this.propertiesPanel = Ext.create('Ext.Panel',{
			bodyCls:'x-filemng-properties',
			region: 'south',
			border:false,
			split:true,
			height: 150,
			minSize: 75,
			maxSize: 250
		});
		this.uploadPanel = Ext.create('Ext.ux.filemng.FileUploader',{
			border:false,
			hidden:true,
			fileMng:this
		});
		this.dockedItems = [{
			xtype: 'toolbar',
			dock: 'top',
			items: [this.pathBar]
		},{
			xtype: 'toolbar',
			dock: 'top',
			items: this.createButtons(this.buttonsCfg.split(','))
		},this.uploadPanel];
		/*this.propertiesPanel = new Ext.Panel({
			bodyCssClass:'x-filemng-properties',
			region: 'south',
			border:false,
			split:true,
			height: 150,
			minSize: 75,
			maxSize: 250
		});
		
		this.listView = new ns.ListView({
			store: this.store,
			multiSelect: true,
			reserveScrollOffset: true,
			autoScroll:false,
			baseUrl:this.baseUrl,
			fileMng:this,
			plugins: [new DragSelector()]
		});
		this.items = [this.uploadPanel,this.treePanel,{
			region:'center',
			border:false,
			layout:'fit',
			codyStyle:{
				overflow: 'hidden'
			},
			items:this.listView
		},this.propertiesPanel];*/
		this.editor = new Ext.Editor({
			cls: 'x-small-editor',
			alignment: 'bl-bl?',
			autoSize: {
				width: 'boundEl'
			},
			field:new Ext.form.TextField({
				allowBlank: false,
				selectOnFocus:true
			}),
			/*doBlur: function(){
				if(this.editing){
					this.field.blur();
				}
			},
			onShow : function(){
				this.el.show();
				if(this.hideEl !== false){
					this.boundEl.hide();
				}
				this.field.show().focus();
				this.fireEvent("startedit", this.boundEl, this.startValue);
			}*/
		});
		this.items = [this.treePanel,{
			region:'center',
			border:false,
			layout:'fit',
			codyStyle:{
				overflow: 'hidden'
			},
			items:this.listView
		},this.propertiesPanel]
		this.callParent(arguments);
		
		this.waitIcon = this.buttonsBar.wait;
		this.waitIcon.hide();
		this.initCmd();
		if(this.buttonsBar.find)
		{
			this.buttonsBar.find.on('keydown',this.onFind,this,{buffer:300});
			this.buttonsBar.find.on('change',this.onFind,this);
			this.buttonsBar.find.on({
				'focus':function(){
					me.keyMap.disable();
				},
				'blur':function()
				{
					me.keyMap.enable();
				}
			});
		}
		//this.setFolder(this.statePath || '/');
	},
	onRender : function(ct, position){
		this.callParent(arguments);
		this.initHotKeys();
	},
	// private
	action:function(controller,action){
		return this.urlAction+'/'+controller + (action?('/'+action):'') ;
	},
	actionParam:function(controller,action,params)
	{
		var a = this.action(controller,action);
		if(params){
			a += '?data=' + Ext.encode(params || {})
		}
		return a;
	},
	// private
	actionRequest:function(controller,action,params,callback,scope)
	{
		var o = {
			url: this.action(controller,action),
			params:{
				data:Ext.encode(params || {})
			}
		};
		if(callback) {
			o.callback =  function(options,success, response){
				var data = null;
				if(success) {
					data = Ext.decode(response.responseText);
				}
				callback.call(scope,data,success,response,options);
			};
		}
		return Ext.Ajax.request(o);
	},
	
	/**
	* Проверка файла на существование
	*/
	fileExist:function(name, callback, scope){
		Ext.Ajax.request({
			url:this.action('files','exists'),
			params:{
				dir:this.getFolder(),
				name:name
			},
			success:function(response){
				var data = Ext.decode(response.responseText);
				callback.call(scope,!!data.data);
			}
		});
	},
	selectRecords:function(records,keepExisting){
		if(this.listView)
		{
			this.listView.select(records,keepExisting);
		}
	},
	selectRange:function(start,end,keepExisting){
		if(this.listView)
		{
			this.listView.selectRange(records,keepExisting);
		}
	},
	selectPrev:function(){
		if(this.listView)
		{
			this.listView.selectPrev();
			this.listView.focus();
		}
	},
	selectNext:function(){
		if(this.listView)
		{
			this.listView.selectNext();
			this.listView.focus();
		}
	},
	selectAll:function(){
		if(this.listView)
		{
			this.listView.selectAll();
		}
	},
	up:function(){
		var t = this.getFolder().split('/').filter(function(c){return c});
		t.splice(t.length-1,1)
		this.setFolder('/'+t.join('/'))
	},
	getSelectedRecord:function(){
		if(this.listView)
		{
			return this.listView.getSelectionModel().getSelection() || [];
		}
		return [];
	},
	getSelectedFiles:function(){
		return this.getSelectedRecord().map(function(c){return c.data;});
	},
	getSelectedPath:function(){
		return this.getSelectedRecord().map(function(c){return c.id;});
	},
	openSelected:function()
	{
		var records = this.getSelectedRecord();
		this.open(records[0]);
	},
	// private
	showWait:function(){
		this.waitIcon.show();
	},
	// private
	hideWait:function(){
		this.waitIcon.hide();
	},
	/**
	* Обновить список файлов
	*/
	refresh:function(){
		this.store.reload();
		this.treePanel.reload(this.path);
		
	},
	/**
	* Удалить файлы
	*/
	deleteFile:function(files){
		var data = [];
		for(var i = 0,l=files.length;i<l;++i) data.push(files[i].get('id'));
		this.actionRequest('files','remove',{'files':data},function(data,success){
			if(success && data.success){
				this.refresh();
			} else {
				Ext.Msg.alert(t('Удаление'), data && data.message || t('Не удалось удалить.'));
			}
		},this);
	},
	/**
	* Переименовать файл в текущей дериктории
	*/
	rename:function(file,name){
		var me = this;
		if(file)
		{
			var node = this.listView.getNode(file);
			if(node){
				this.scrollNode(node);
				node = Ext.get(node).query(this.editNameSelector);
				var value = name || file.get('name');
				if(node && node.length) {
					this.editor.startEdit(node[0],value);
					if(file.get('type') != 'folder'){
						Ext.Function.defer(function(){
							me.editor.field.selectText(0,value.lastIndexOf('.'));
						},10);
					}
					this.activeRecord = file;
					this.keyMap.disable();
				}
			}
		}
	},
	// private
	onRenameSave:function(ed, value){
		var me = this;
		me.keyMap.enable();
		if(value){
			var oldvalue = this.activeRecord.get('name');
			if(oldvalue != value){
				if(me.activeRecord.phantom)
				{
					var path = me.activeRecord.get('path');
					this.actionRequest('files','newfolder',{path:path,name:value},function(data,success){
						if(success && data.success){
							me.activeRecord.data = data.data;
							if(data.data.lastmod){
								me.activeRecord.data.lastmod = Ext.Date.parseDate(data.data.lastmod,'U');
							}
							me.activeRecord.commit();
							me.activeRecord.phantom = false;
							me.treePanel.reload(path);
						} else {
							Ext.Msg.alert(t('Создание новой папки'), data && data.message || t('Не удалось создать папку.'));
							me.store.remove(me.activeRecord);
							me.activeRecord = null;
						}
					});
				}
				else
				{
					var path = me.activeRecord.get('id');
					this.actionRequest('files','rename',{path:path,name:value},function(data,success){
						if(success && data.success){
							me.activeRecord.data = data.data;
							if(data.data.lastmod){
								me.activeRecord.data.lastmod = Ext.Date.parseDate(data.data.lastmod,'U');
							}
							me.activeRecord.commit();
							var id = path.substr(0,path.lastIndexOf('/'));
							me.treePanel.reload(id);
						} else {
							Ext.Msg.alert(t('Переименовывание'), data && data.message || t('Не получилось переименовать.'));
						}
					});
				}
			}
		}
	},
	// private
	onLoadData:function(data){
		this.store.loadData(data);
		this.autoDetectTypeView();
	},
	// private
	autoDetectTypeView:function(){
		var folder = this.getFolder();
		var type = Ext.state.Manager.get('filemng-view-state-'+this.getFolder());
		if(!type)
		{
			type = (this.store.find('type','image')!=-1)?'icon':'list';
		}
		this.setTypeView(type,false);
	},
	/**
	* Перейти в деректорию path
	*/
	setFolder:function(path){
		if(this.path != path) {
			this.path = path;
			this.pathBar.setFolder(path);
			this.store.proxy.extraParams.dir = path;
			this.store.load({callback:this.autoDetectTypeView,scope:this});
			if(this.treePanel){
				this.treePanel.selectPath(path);
			}
			this.saveState();
		}
	},
	/**
	* Получить путь к выбранной директории
	*/
	getFolder:function(){
		return this.path;
	},
	 // private
	getState : function(){
		return {
			statePath:this.path,
			treePanelHidden:this.treePanel.hidden,
			propertiesPanelHidden:this.propertiesPanel.hidden
		};
	},
	// private
	applyState : function(state){
		this.callParent(arguments);
		if(state) {
			this.buttonsBar.toggle_tree.pressed = !(this.treePanel.hidden = this.treePanelHidden);
			this.buttonsBar.toggle_property.pressed = !(this.propertiesPanel.hidden = this.propertiesPanelHidden);
			this.treePanel.on('load',function(){
				this.setFolder(this.statePath || '/');
			},this,{single:true});
		}
	},
	/**
	* Добавить команду
	*/
	addCmd:function(cmd,fn,scope){
		if('object' == typeof cmd){
			if(cmd.cmd && cmd.fn)
			{
				this.addCmd(cmd.cmd,cmd.fn,cmd.scope);
			} else {
				for(var n in cmd) {
					if(n != 'scope' && n != 'cmd'){
						this.addCmd(n,cmd[n],cmd.scope);
					}
				}
			}
			return;
		} else {
			this.commands[cmd] = {
				fn:fn,
				scope: scope || this
			};
		}
	},
	/**
	* Выполнить команду
	*/
	exeCmd:function(name,arg){
		var cmd = this.commands[name];
		if(cmd){
			return cmd.fn.apply(cmd.scope,arg || []);
		}
	},
	onLinkExtCmd:function(e){
		var t = e.getTarget('a.ext-cmd');
		if(t){
			var cmd = t.id.replace('cmd_','');
			this.exeCmd(cmd);
			e.stopEvent();
		}
	},
	// private
	createCmdHandler:function(cmd){
		return function(keyCode, e){
			if(e.stopEvent) e.stopEvent();
			return this.exeCmd(cmd, arguments);
		}
	},
	// private
	initCmd:function(){
		this.commands = {};
		this.addCmd({
			'refresh':this.onRefresh,
			'addfolder':this.onAddFolder,
			'del':this.onDelete,
			'rename':this.onRename,
			'toggle_tree': this.onTogglePanel(this.treePanel),
			'toggle_property':this.onTogglePanel(this.propertiesPanel),
			//'upload_file':this.onUploadToggle,
			'upload_file_show':this.uploadShow,
			'upload_file_hide':this.uploadHide,
			'copy':this.onCopyFile,
			'paste':this.onPasteFile,
			'cut':this.onCutFile,
			'select_prev':this.selectPrev,
			'select_next':this.selectNext,
			'select_all':this.selectAll,
			'open_selected':this.openSelected,
			'up':this.up,
			'load_arhive':this.loadArhiveSelectFile,
			'load_file':this.loadSelectFile,
			'view_list': Ext.Function.bind(this.setTypeView,this,['list'],0),
			'view_icon':Ext.Function.bind(this.setTypeView,this,['icon'],0)
		});
	},
	// private
	initTemplates:function(){
		function b(cmd, text, cls)
		{
			return '<a href="javascript:void(0)" class="ext-cmd x-filemng-button ' + (cls || '') + '" id="cmd_' + cmd + '">' + text + '</a>';
		}

		this.tpls = {
			'file':new Ext.XTemplate(
				'<div class="x-filemng-params"><ul>',
					'<li>',t('Имя файла'),': <b>{name}</b></li>',
					'<tpl if="lastmod"><li>',t('Время изменения'),': <b>{lastmod:date("d.m.Y h:i:s")}</b></li></tpl>',
					'<tpl if="size"><li>',t('Размер файла'),': <b>{size:fileSize}</b></li></tpl>',
				'</ul></div>',
				'<div class="x-filemng-buttons">',
					'<tpl if="type!=\'dir\'">', b('load_file',t('Скачать'),'b-download'), '</tpl>',
					b('load_arhive',t('Скачать архивом'),'b-download'),
				'</div>'
			),
			'folder':new Ext.XTemplate(
				'<div class="x-filemng-params"><ul>',
					'<li>',t('Папка с файлами'),': <b>{name}</b></li>',
				'</ul></div>',
				'<div class="x-filemng-buttons">',
					b('load_arhive',t('Скачать архивом'),'b-download'),
				'</div>'
			),
			'image': new Ext.XTemplate(
				'<div class="x-filemng-preview">',
					box('<div class="wrap-image"><img src="'+this.baseUrl+'{id}" height="100" alt="{name}"/><div class="magnifier" ></div><div class="white" ></div></div>'),
				'</div>',
				'<div class="x-filemng-params"><ul>',
					'<li>',t('Имя файла'),': <b>{name}</b> </li>',
					'<tpl if="lastmod"><li>',t('Время изменения'),': <b>{lastmod:date("d.m.Y h:i:s")}</b></li></tpl>',
					'<tpl if="size"><li>',t('Размер файла'),': <b>{size:fileSize}</b></li></tpl>',
					'<li>',t('Ширина'),': <b>{width}px</b></li>',
					'<li>',t('Высота'),': <b>{height}px</b></li>',
				'</ul></div>',
				'<div class="x-filemng-buttons">',
					b('load_file',t('Скачать'),'b-download'),
					b('load_arhive',t('Скачать архивом'),'b-download'),
				'</div>'
			),
			'select': new Ext.Template(
				'<div class="x-filemng-params"><ul>',
					'<li>',t('Выбрано элементов'),': <b>{number}</b> из <b>{numberFolder}</b></li>',
				'</ul></div>',
				'<div class="x-filemng-buttons">',
					b('load_arhive',t('Скачать архивом'),'b-download'),
				'</div>'
			),
			'noselect': new Ext.Template(
				'<div class="x-filemng-params"><ul>',
					'<li>',t('Папка с файлами'),': <b>{name}</b></li>',
					'<li>',t('Элементов в папке'),': <b>{numberFolder}</b></li>',
				'</ul></div>',
				'<div class="x-filemng-buttons">',
					b('load_arhive',t('Скачать архивом'),'b-download'),
				'</div>'
			)
		};
	},
	// private
	getTemplateInfo:function(type){
		if(type in this.tpls){
			return this.tpls[type];
		}
		return this.tpls.file;
	},
	//private
	initEvents:function(){
		this.callParent();
		
		this.treePanel.on('itemclick',this.onSelectTreeFolder,this);
		this.pathBar.on('select',this.onSelectPathBar,this);
		this.store.on({
			'beforeload':this.showWait,
			'load':this.hideWait,
			'exception':function(a,b,c,d,e ){
				this.hideWait();
			},
			scope:this
		});
		this.listView.on({
			itemdblclick:this.dblClickFile,
			selectionchange:this.onSelectFileScroll,
			render:this.onSelectFileChange,
			scope:this
		});
		this.listView.on('selectionchange',this.onSelectFileChange,this,{buffer:50});
		if(this.listView.rendered){
			this.onSelectFileChange(this.listView);
		}
		this.store.on('load',function(){this.onSelectFileChange(this.listView);},this);
		
		this.editor.on({
			'complete':this.onRenameSave, 
			scope:this
		});
		
		this.el.on('click',this.onLinkExtCmd,this,{delegate:'a.ext-cmd'});
	},
	// private
	initHotKeys:function()
	{
		if(this.enableHotkeys)
		{
			var hk = [];
			for(var i = 0,l=this.hotkeys.length;i<l;++i)
			{
				hk.push(Ext.apply({
					fn:this.createCmdHandler(this.hotkeys[i].cmd),
					scope:this
				},this.hotkeys[i]));
			}
			this.keyMap = new Ext.KeyMap(Ext.getDoc(), hk);
			this.keyMap.enable();
		}
	},
	// private
	dblClickFile:function(list, record)
	{
		this.open(record);
	},
	open:function(record){
		if(record.get('type') == 'folder') {
			this.openFolder(record.get('id'));
		} else {
			this.openFile(record.get('id'),record.get('type'));
		}
	},
	onSelectFileChange:function(view,selections){
		var records = this.getSelectedRecord();
		var info = '';
		if(records.length == 1){
			var tpl = this.getTemplateInfo(records[0].get('type'));
			info = tpl.apply(records[0].data);
		} else {
			var tpl = this.getTemplateInfo(records.length?'select':'noselect');
			info = tpl.apply({name:this.path,number:records.length, numberFolder: this.store.getCount()});
		}
		this.propertiesPanel.body.update(info)
		Ext.ux.filemng.imagesLoader(this.propertiesPanel.body);
	},
	onSelectFileScroll:function(){
		var nodes = this.listView.getSelectedNodes();
		if(nodes.length){
			this.scrollNode(nodes);
		}
	},
	scrollNode:function(node){
//		Ext.get(node).scrollIntoView(this.listView.getTemplateTarget().parent(),true);
	},
	openFolder:function(path){
		this.setFolder(path);
	},
	openFile:function(path,type){
		var win = window.open(this.baseUrl + path);
	},
	// private
	createButtons:function(buttons){
		var res = [];
		var bb = {};
		for(var i = 0,l=buttons.length;i<l;++i){
			var n = buttons[i];
			if(n == '|') {
				res.push('-');
			} else if(n == '->'){
				res.push('->');
			} else {
				var b = this.buttonsBar[n];
				if(b){
					var cfg = this.buttonsBar[n];
					b = Ext.createByAlias('widget.' + (cfg.xtype || 'button'), Ext.applyIf({
						handler:this.createCmdHandler(b.cmd || n),
						scope:this
					},cfg));
					if(b) {
						bb[n] = b;
						res.push(b);
					}
				}
			}
		}
		this.buttonsBar = bb;
		return res;
	},
	// private
	
	// private
	onTogglePanel:function(panel){
		return function(b){
			panel.setVisible(b.pressed);
			this.doLayout();
			this.saveState();
		};
	},
	// private
	onSelectTreeFolder:function(tree, record, item, index, e, eOpts ){
		this.openFolder(record.get('id'));
	},
	// private
	onSelectPathBar:function(bar,path){
		this.openFolder(path);
	},
	// private
	onDelete:function(){
		var records = this.listView.getSelectedRecords();
		if(records && records.length) {
			Ext.Msg.confirm(t('Удаление'), t('Выдействительно хотите удалить?'), function(btn){if (btn == 'yes'){
				this.deleteFile(records);
			}},this);
		}
	},
	// private
	onRename:function(){
		var records = this.listView.getSelectedRecords();
		if(records && records.length) {
			this.rename(records[0]);
		}
	},
	// private
	onAddFolder:function(){ 
		var folder = Ext.create('Ext.ux.filemng.ModelFile',{
			type:'folder',
			path:this.path,
			size:0
		});
		this.store.insert(0,folder);
		this.rename(folder,this.newFolderName);
	},
	// private
	onRefresh:function(){
		this.refresh();
	},
	// private
	onUploadToggle:function(button){
		if(button.pressed){
			this.uploadShow();
		} else {
			this.uploadHide();
		}
	},
	// private
	onFind:function(field){
		var v = field.getValue();
		if(v){
			this.store.filter('name',v, true);
		} else {
			this.store.clearFilter();
		}
	},
	// private
	uploadShow:function(){
		if(this.uploadPanel.hidden)
		{
			this.uploadPanel.show();
			this.doLayout();
		}
		if(this.buttonsBar.upload_file){
			this.buttonsBar.upload_file.toggle(true);
		}
	},
	// private
	uploadHide:function(){
		if(!this.uploadPanel.hidden)
		{
			this.uploadPanel.hide();
			this.doLayout();
		}
		if(this.buttonsBar.upload_file){
			this.buttonsBar.upload_file.toggle(false);
		}
	},
	// private
	onPasteFile:function(){
		var folder = this.getFolder();
		if(this.fileAction && this.fileAction.files && this.fileAction.files.length && this.fileAction.type) {
			if(folder != this.fileAction.folder)
			{
				this.actionRequest('files',this.fileAction.type,{target:folder,source:this.fileAction.folder,files:this.fileAction.files.map(function(c){return c.id})},function(data,success){
					if(success && data.success){
						this.onLoadData(data);
						this.treePanel.reload(folder);
					} else {
						Ext.Msg.alert(t('Копирование'), data && data.message || t('Не удалось скопировать.'));
					}
				},this);
			}
		}
		this.clearAction();
	},
	// private
	onCutFile:function(){
		var files = this.getSelectedRecord();
		if(files.length){
			this.clearAction();
			this.fileAction = {
				type:'cut',
				folder: this.getFolder(),
				files:files.map(function(rec){
					rec.set('action','cut');
					return rec.data
				})
			}
		}
	},
	// private
	onCopyFile:function(){
		var files = this.getSelectedRecord();
		if(files.length){
			this.clearAction();
			this.fileAction = {
				type:'copy',
				folder: this.getFolder(),
				files:files.map(function(rec){
					rec.set('action','copy');
					return rec.data
				})
			}
		}
	},
	/**
	* Сбросить действия с файлов
	*/
	clearAction:function()
	{
		this.store.each(function(rec){rec.set('action','');});
	},
	
	/**
	* Выставить тип отображения файлов
	*/
	setTypeView:function(type, state){
		this.listView.setTypeView(type);
		var name = 'view_'+type;
		if(this.buttonsBar[name]){
			this.buttonsBar[name].toggle(true);
		}
		if(state !== false){
			Ext.state.Manager.set('filemng-view-state-'+this.getFolder(),type);
		}
	},
	getInfoFile:function(path, callback,scope){
		this.actionRequest('files','getInfo',{path:path},callback,scope);
	},
	getInfoSelectFile:function(callback,scope){
		this.getInfoFile(filemng.getSelectedPath()[0],callback,scope);
	},
	loadArhiveSelectFile:function(){
		var files = this.getSelectedPath();
		if(!(files && files.length)){
			files = [this.getFolder()];
		}
		var win = window.open(this.actionParam('files','arhive',{files:files}));
	},
	loadSelectFile:function(){
		var files = this.getSelectedPath();
		if(files){
			for(var i = 0,l = files.length; i < l;++i)
			{
				var win = window.open(this.baseUrl + files[i]);
			}
		}
	}
});

})();