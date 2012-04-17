var openmdao = (typeof openmdao == "undefined" || !openmdao ) ? {} : openmdao ; 

openmdao.BaseFrame = function () {
    id:         null;   // the id attribute of the element the frame is built on
    elm:        null;   // the element the frame is built on wrapped by jQuery
    par:        null;   // the parent element as a jQuery object
    title:      "";     // the title to be used for this frame
    menu:       null;   // an optional menu     
}
     
openmdao.BaseFrame.prototype.init = function (id,title,menu) {
/*  initialize a BaseFrame on the element with the given ID
    if the element doesn't exist it will be created as a popup
    any existing HTML under the element will be deleted
    if a menu is provided, then it will be built into the frame
 */
    this.id = id;
    this.title = title;
    this.menu = menu;

    if (this.id) {
        this.elm = jQuery("#"+this.id);
    }
    else {
        if (openmdao.uniqueID) {
            openmdao.uniqueID = openmdao.uniqueID + 1;
        }
        else {
            openmdao.uniqueID = 1;
        }
        this.id = "BaseFrame"+openmdao.uniqueID
    }
    
    // if the elm doesn't exist, create it as a popup 
    if (this.elm && this.elm.length > 0) {
        this.par = this.elm.parent();
    }
    else {
        this.par = null;
        this.elm = jQuery('<div id='+this.id+'></div>');
        this.popup(this.title);
    }
        
    // delete any existing content and prevent browser context menu
    this.elm.html("")
                 .bind("contextmenu", function(e) { return false; })
    
    // create menubar and add menu if one has been provided
    if (this.menu) {        
        var menuID = this.id+"-menu",
            menuDiv = this.elm.append("<nav2 id='"+menuID+"'>"),
            popButton = jQuery("<div title='Pop Out' style='position:absolute;top:5px;right:5px;z-index:1001'>*</div>")
                .click( function() { this.popout(this.title) }.bind(this)
            )
        new openmdao.Menu(menuID,this.menu)
        // FIXME: HACK, add button to make window pop out (TODO: alternately open in new browser window?)
        menuDiv.append(popButton)
    }                
},
    
openmdao.BaseFrame.prototype.popup = function (title) {
    /* put this frame in a popup */
    this.elm.dialog({
        'modal': false,
        'title': title,
        'close': function(ev, ui) {
                    this.close();
                 }.bind(this),
        width:   'auto',
        height:  'auto'
    })
}

openmdao.BaseFrame.prototype.setTitle = function (title) {
    if (title) {
        this.title = title
        this.elm.dialog('option', 'title', title);
    }
}

openmdao.BaseFrame.prototype.handleMessage = function (json) {
    debug.info(this.title,'received message',json)
}

openmdao.BaseFrame.prototype.close = function () {
    // assuming I'm a dialog: if I have a parent then re-dock with it, else self-destruct
    if (this.par) {
        this.elm.dialog('destroy')
        this.elm.appendTo(this.par)
        this.elm.show()
    }
    else {
        this.elm.dialog('destroy')
        this.elm.remove(); 
    }
}

openmdao.BaseFrame.prototype.popout = function (title) {
    debug.info('BaseFrame.popout()',this)
    var init_fn = "jQuery(function(){openmdao.PopoutFrame()})";
    var new_win = openmdao.Util.popupWindow("/workspace/base?head_script='"+init_fn+"'",title,600,800)
    debug.info('new_win',new_win)
}

openmdao.PopoutFrame = function() {
    debug.info('window',window);
    debug.info('opener',opener);
	openmdao.model = opener.openmdao.model;
    debug.info('openmdao.model',openmdao.model);
	openmdao.model.issueCommand('print "hello from another world"')
    jQuery('body').append('<div id="palette"></div>');
    debug.info('divs',jQuery('div'));
	new openmdao.Palette("palette",  openmdao.model) 
}