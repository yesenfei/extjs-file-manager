Ext.define('Ext.ux.filemng.FileUploader', {
	extend: 'Ext.form.field.File',
	alias: ['widget.filemngupload'],
	emptyText: Ext.ux.filemng.t('Выберите файл для загрузки'),
	fieldLabel: Ext.ux.filemng.t('Файл'),
	name: 'file',
	buttonOnly:true,
	hideLabel: true,
	buttonConfig: {
		text:Ext.ux.filemng.t('Загрузить'),
		tooltip:Ext.ux.filemng.t('Загрузить файл'),
		iconCls: 'b-upload-file'
	},
	initComponent:function()
	{
		var me = this;
		Ext.applyIf(this,{
			
		});
		this.callParent(arguments);
	},
	onRender:function(){
		this.callParent(arguments);
		this.form = this.buttonEl.wrap({tag:'form'});
	},
	onFileChange:function()
	{
		this.callParent();
		this.onSave();
	},
	upload:function(name){
		var me = this,
			fileMng	= this.up('filemng');
		Ext.Ajax.request({
			url: fileMng.action('files','upload'),
			waitMsg: Ext.ux.filemng.t('Загрузка...'),
			isUpload:true,
			form:this.form,
			params:{
				dir:fileMng.getFolder(),
				name: name
			},
			success: function(response, o){
				var result = Ext.decode(response.responseText);
				if(result.success)
				{
					fileMng.onLoadData(result.data);
					me.reset();
				} else {
					Ext.Msg.alert(Ext.ux.filemng.t('Не удача'), action.result.message);
				}
			},
			failure: function() {
				Ext.Msg.alert(Ext.ux.filemng.t('Не удача'), Ext.ux.filemng.t('Сервер не доступен.'));
			}
		});
	},
	onSave:function(){
		var me = this,
			fileMng	= me.up('filemng'),
			name = me.getValue();
		
		name = name.substr(name.replace((/\\/igm), '/').lastIndexOf('/')+1);
		
		fileMng.fileExist(name,function(exist){
			if(exist){
				Ext.Msg.confirm(Ext.ux.filemng.t('Загрузка'),Ext.ux.filemng.t('Файл существует, заменить?'),function(b){
					if(b == 'yes'){
						me.upload(name);
					} else {
						me.reset();
					}
				});
			} else {
				me.upload(name);
			}
		});
	}
});

