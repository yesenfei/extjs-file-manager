Ext.define('Ext.ux.filemng.ListView', {
	extend: 'Ext.view.View',
	alias: ['widget.filemnglist'],
	typeView:'list',
	cls:'x-filemng-list',
	columns: [{
		text: Ext.ux.filemng.t('Название'),
		dataIndex: 'name',
		width: 0.5,
		//tpl: '{name}<div class="contrl"><a class="b-download"></a><a class="b-del"></a></div>',
		cls:'file-name'
	},{
		text: Ext.ux.filemng.t('Время изменения'),
		xtype: 'datecolumn',
		width: 0.25, 
		tpl: '<tpl if="lastmod">{lastmod:date("d.m.Y h:i:s")}</tpl>',
		dataIndex: 'lastmod'
	},{
		text: Ext.ux.filemng.t('Размер'),
		dataIndex: 'size',
		tpl: '<tpl if="size">{size:fileSize}</tpl>',
		align: 'right',
		cls: 'listview-filesize',
		width: 0.15
	},{
		text: Ext.ux.filemng.t('Доступ'),
		dataIndex: 'state',
		tpl: '<tpl if="values.state">{[values.state.perms.human]}</tpl>',
		cls: 'listview-perms',
		align: 'center',
		width: 0.10
	}],

	initComponent:function(){
		this.columns = [].concat(this.columns);
		for(var i = 0; i < this.columns.length; ++i)
		{
			this.columns[i].sort = '';
			if(this.columns[i].tpl)
			{
				this.columns[i].tpl = Ext.XTemplate.getTpl(this.columns[i], 'tpl');
			} else {
				this.columns[i].tpl = new Ext.Template("{"+this.columns[i].dataIndex+"}");
			}
			
		}
		this.initTemplates();
		this.setTypeView(this.typeView);
		this.dockedItems = [{
			xtype: 'toolbar',
			dock: 'top',
			items: [{text:'test', xtype:'button'}]
		}];
		this.callParent();
		this.on('resize', this.onResize,this);
	},
	
	onRender : function(){
		this.callParent(arguments);
		this.addClass("x-filemng-view"+this.typeView);
		this.el.on('click', this.onClickHeader, this, {delegate:'td.x-list-column'});
	},
	refresh : function() {
		this.callParent(arguments);
		this.onResize();
		Ext.ux.filemng.imagesLoader(this.getContentTarget(),'div.type-image img');
	},
	onClickHeader:function(e)
	{
		var t = e.getTarget('em',10);
		if(t)
		{
			var i = t.id.replace(this.id + '-xlhd-', '') - 1 ;
			if(this.sortIndex !== undefined && this.sortIndex != i) this.columns[this.sortIndex].sort = '';
			this.sortIndex = i;
			if(this.columns[i].sort != 'DESC')
			{
				this.columns[i].sort = 'DESC';
			} else {
				this.columns[i].sort = 'ASC';
			}
			this.store.sort(this.columns[i].dataIndex, this.columns[i].sort);
		}
	},
	onUp:function(e){
		
	},
	onDown:function(e){
		
	},
	setTypeView:function(type)
	{
		this.tpl = this.templates[type];
		if(this.typeView != type){
			this.typeView = type;
			this.refresh();
		}
	},
	collectData : function(records, startIndex){
		return {
			'rows': this.callParent(arguments),
			'columns' : this.columns
		};
	},
	//overClass:'x-view-over',
	itemSelector:'.file-item',
	initTemplates:function(){
		
		this.internalTpl = [
			'<div class="x-list-header-wrap">',
			'<table class="x-list-header"><tr class="x-list-header-inner">',
				'<tpl for="columns">',
				'<td class="x-list-column x-column-header-sort-{sort}" style="width:{[values.width*100]}%;text-align:{align};"><em unselectable="on" id="',this.id, '-xlhd-{#}" class="x-column-header-text">',
					'{text}',
				'</em></td>',
				'</tpl>',
			'</tr></table></div>',
		];
		this.templates = {
			'list':new Ext.XTemplate(
				'<div class="x-list-body-wrap">',
				this.internalTpl.join(''),
				'<div  class="x-filemng-listview x-list-body">',
				'<tpl for="rows">',
					'<dl class="file-item type-{type}<tpl if="values.action"> action-{action}</tpl>">',
						'<tpl for="parent.columns">',
						'<dt style="width:{[values.width*100]}%;text-align:{align};" id="{id}" >',
						'<em unselectable="on"<tpl if="cls"> class="{cls}"</tpl>>',
							'<tpl if="cls==\'file-name\'"><img src="'+Ext.BLANK_IMAGE_URL+'" alt="" class="file-icon file-icon-{parent.cls}"/></tpl>',
							'{[values.tpl.apply(parent)]}',
						'</em></dt>',
						'</tpl>',
						'<div class="x-clear"></div>',
					'</dl>',
				'</tpl>',
				'</div>',
				'</div>'
			),
			'icon':new Ext.XTemplate(
				'<div class="x-list-body-wrap">',
				this.internalTpl.join(''),
				'<div  class="x-filemng-icon x-list-body">',
				'<tpl for="rows">',
					'<div class="thumb-wrap file-item type-{type}<tpl if="values.action" id="{id}"> action-{action}</tpl>">',
						'<div class="thumb">',
							'<tpl if="type==\'image\'">',
								//'<img class="file-icon" src="'+this.baseUrl+'{preview}" title="{name}"/>',
								'<img class="file-icon" width="100" height="75" src="'+this.fileMng.action('files','preview')+'{id}?width=100&height=75&mode=2" title="{name}"/>',
								'<div class="imgsize">{width}x{height}</div>',
								'<div class="wite"></div>',
							'</tpl>',
							'<tpl if="type!=\'image\'">',
								'<img class="file-icon" src="'+Ext.BLANK_IMAGE_URL+'" title="{name}"/>',
							'</tpl>',
						'</div>',
						'<span class="x-editable file-name">{name:ellipsis(15)}</span>',
					'</div>',
				'</tpl>',
				'<div class="x-clear"></div>',
				'</div>',
				'</div>'
			)
		};
	},
	onResize:function(){
		var body = this.el.select('div.x-list-body');
		body.setHeight(this.el.getHeight() - 25);
	},
	selectPrev:function(){
		var i = 1, selections = this.getSelectionModel().getSelection();
		if(selections.length)
		{
			i = this.store.indexOf(selections[selections.length-1]);
		}
		if(i > 0)
		{
			var record = this.store.getAt(i-1);
			this.getSelectionModel().select(record);
		}
	},
	selectNext:function(){
		var i = -1,selections = this.getSelectionModel().getSelection();
		if(selections.length)
		{
			var i = this.store.indexOf(selections[selections.length-1]);
		}
		if(i < this.store.getCount())
		{
			var record = this.store.getAt(i+1);
			this.getSelectionModel().select(record);
		}
	},
	selectAll:function()
	{
		this.getSelectionModel().selectRange(0, this.store.getCount()-1);
	},
	getSelectedRecords:function()
	{
		return this.getSelectionModel().getSelection();
	}
});


