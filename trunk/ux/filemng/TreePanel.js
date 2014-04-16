Ext.define('Ext.ux.filemng.TreePanel', {
	extend: 'Ext.tree.Panel',
	alias: ['widget.filemngtree'],
	autoScroll:true,
	useArrows: true,
	animate: true,
	containerScroll: true,
	border: false,
	split: true,
	rootVisible: false,
	root: {
		nodeType: 'async',
		text: 'root',
		draggable: false,
		id: '/'
	},
	selectPath : function(path, attr, callback){
		if(Ext.isEmpty(path)){
			if(callback){
				callback(false, undefined);
			}
			return;
		}
		attr = attr || 'id';
		
		var keys = path.split(this.pathSeparator).filter(function(v){return !!v;}),
			v = this.pathSeparator+keys.join(this.pathSeparator);
		keys.pop();
		if(keys.length){
			var f = function(success, node){
				if(success && node){
					var n = node.findChild(attr, v);
					if(n){
						n.select();
						if(callback){
							callback(true, n);
						}
					}else if(callback){
						callback(false, n);
					}
				}else{
					if(callback){
						callback(false, n);
					}
				}
			};
			this.expandPath(keys.join(this.pathSeparator), attr, f);
		}
	},

	expandPath : function(path, attr, callback){
		if(Ext.isEmpty(path)){
			if(callback){
				callback(false, undefined);
			}
			return;
		}
		attr = attr || 'id';
		var keys = path.split(this.pathSeparator);
		var curNode = this.root;
		var index = 0;
		var s = this.pathSeparator;
		var f = function(){
			if(index == keys.length){
				if(callback){
					callback(true, curNode);
				}
				return;
			}
			++index;
			var c = curNode.findChild(attr, s+keys.slice(0,index).join(s));
			if(!c){
				if(callback){
					callback(false, curNode);
				}
				return;
			}
			curNode = c;
			c.expand(false, false, f);
		};
		curNode.expand(false, false, f);
	},
	reload:function(id)
	{
		var node = this.store.getNodeById(id || '/');
		if(node && node.isLoaded())
		{
			this.store.load({node:node});
		}
	}
});

