/**
 * @class Ext.ux.filemng.PathToolbar
 * @extends Ext.toolbar.Toolbar
 * 
 * @xtype filemngpathbar
 */
Ext.define('Ext.ux.filemng.PathToolbar', {
	extend: 'Ext.Component',
	alias: ['widget.filemngpathbar'],
	requires:['Ext.XTemplate'],
	initComponent:function(){
		this.tpl = new Ext.XTemplate(
			'<div class="x-filemng-path"><a href="/" title="Root folder">file:</a> ',
			'<tpl for=".">',
				'<span>/</span><a href="{path}" title="{path}">{name}</a>',
			'</tpl>',
			'</div>'
		);
		this.callParent(arguments);
	},
	onRender : function(ct, position){
		this.callParent(arguments);
		this.setFolder(this.path || '');
		this.initEvent();
	},
	initEvent:function()
	{
		this.el.on('click',this.onSelect,this,{delegate:'a'});
	},
	onSelect:function(e,t){
		e.stopEvent();
		this.fireEvent('select',this,decodeURIComponent(t.pathname));
		return false;
	},
	setFolder:function(path)
	{
		this.path = path;
		var p = '';
		if(this.el) {
			var data = [];
			var items = path.replace('\\','/').split('/');
			for(var i = 0,l=items.length;i<l;++i){
				var v = items[i];
				if(v){
					data.push({
						name:v,
						path: p+= '/' + v
					});
				}
			}
			this.tpl.overwrite(this.el,data);
		}
	}
});

