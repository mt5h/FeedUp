const categories = [
	'favorite',
	'education',
	'tech',
	'news',
	'finance',
	'misc'
];

function feed(){
		this.id = 0;
		this.url = '';
		this.title = '';
		this.website = '';
		this.description = '';
		this.category = '';
		this.favorite = false;
		this.refresh = 0;
};

function close_modal(){
	$('#url').val("").removeClass(['valid','invalid']);
	$('#title').val("").removeClass(['valid','invalid']);
	$('#website').val("").removeClass(['valid','invalid']);
	$('#description').val("").removeClass(['valid','invalid']);
	$('select').prop('selectedIndex', 0);
	$('#favourite-checkbox').prop('checked', false);
	$('#refresh-range').val(10);
	M.updateTextFields();
	$("#delete-modal-close").hide('fast');
	$('.modal').modal('close');
	isAuthenticated(populateMenu);
};


function update_modal(button){
	$('.modal').modal('open');
	$("#delete-modal-close").show('fast');
	$('select').formSelect();
	$.get("/feed/edit/" + button.name , function(response){
		$('#url').val(response.url);
		$('#title').val(response.title);
		$('#description').val(response.description);
		$('#website').val(response.website);
		$("#category-select").val(response.category).change();
		$('select').formSelect();
		$('#favourite-checkbox').prop('checked', response.favorite);
		$('#refresh-range').val(response.refresh / 60);
		$('#subscribe').prop('type', "update");
		$('#subscribe').prop('data-id', response.id);
		//$('#subscribe').prop('name', response.id);
		$('.feed-action').prop('innerText', "edit");
		$('#delete-modal-close').prop('data-id', response.id);
		//$('#delete-modal-close').prop('name', response.id);
		M.updateTextFields();
	});

};

function delete_feed(data){
	post_data("/feed/delete", data);
};

function update_feed(data){
	post_data("/feed/update", data);
};

function create_feed(data){
	post_data("/feed/create",data);
};

function toast_alert(message){
 	M.toast({html: message, classes: 'red z-depth-3'});
};

function toast_notification(message){
 	M.toast({html: message, classes: 'green z-depth-3'});
};

function post_data(url, data){
	$.post(url, data)
	.done(function(response) {
			toast_notification(response.message);
			close_modal();
			isAuthenticated(updateFeeds);
			window.location.replace(window.location.pathname);
		})
	.fail(function(response) {
			toast_alert(response.responseJSON.message);
		});
};

function check_feed(url){
	$.post('/feed/check', {'url':url})
	.done(function(response) {
			toast_notification(response.message);
			$('#title').val(response.title);
			$('#description').val(response.description);
			$('#website').val(response.link);
			M.updateTextFields();
		})
	.fail(function(response) {
			// console.log("failed check " + JSON.stringify(response));
			toast_alert(response.responseJSON.message);
		});
};

function populateMenu(){
		$.get( "/feed/show", function(response) {
			$("#user-menu").html(response);
			$('.dropdown-trigger').dropdown();
		})
		.fail(function() {
			toast_alert(response.responseJSON.message);
		});
};

function populateNotifications(){
		$.get( "/feed/notification")
		.done(function(response) {
			$('#notification-list').html(response);
			$('.notification-trigger').dropdown('recalculateDimensions');
		})
		.fail(function() {
			toast_alert(response.responseJSON.message);
		});
};

function add_feed(){
		$('.modal').modal('open');
		$('select').formSelect();
		$('#subscribe').prop('type', "add");
		$('#feed-action').prop('innerText', "add");
}

function isAuthenticated(callback){
	$.getJSON('/auth/status',function(result){
		if (result.authenticated){
			callback(result);
			return true;
		}
		else{return false;}
		})
	.fail(function() {
		return false;
	});
};

function fillCollapsible(){
	var current = $("#main-collapsible").children('li.active');
	var feed_id = current.attr('data-feed');
	$.get( "/feed/query/" + feed_id)
	.done(function(response) {
		current.find(".collapsible-body").html(response);
		$('.sub-collapsible').collapsible();
		//current.find(".update-badge").hide("slow");
		//isAuthenticated(updateFeeds);
		})
	.fail(function(response) {
			var html_error =  '<div class="center-align"><i class="material-icons large center">sentiment_very_dissatisfied</i></div>';
			current.find(".collapsible-body").html(html_error);
			toast_alert(JSON.stringify(response.responseJSON.message));
		});
};

function updateFeeds(){
		$.get( "/feed/status")
		.done(function (response){
			var total_updates = 0;
			response.forEach(function(channel){
				var channel_updates = 0;
				for (var i = 0; i < channel.items.length; i++) {
					if (channel.items[i].notification){
						channel_updates += 1;
					}
				}
				total_updates += channel_updates;
				if (channel_updates > 0 ){
					$( "li[data-feed=" + channel.id + "]" ).find(".update-badge").prop("innerText", channel_updates);
					$( "li[data-feed=" + channel.id + "]" ).find(".update-badge").show("fast");
				} else {
					$( "li[data-feed=" + channel.id + "]" ).find(".update-badge").hide("fast");
				}
			});
		$('#notification-counter').prop("innerText", total_updates);
		if (total_updates > 0 ){
			$('#notification-counter').addClass("pulse");
		}
		else {
			$('#notification-counter').removeClass("pulse");
		}

		if (total_updates > 9){
			$('#notification-counter').css("padding", "10px");
		} else {
			$('#notification-counter').css("padding", "5px 9px");
		}
		})
		.fail(function(response) {
			toast_alert(JSON.stringify(response.responseJSON.message));
			});
};


function displayUser(details){
			$('.register').hide("fast");
			$('.authenticated').show("fast");
			$('#account-action').prop("innerText","logout");
			$('#account-action').prop("href","/logout");
			$('#account-action-mobile').prop("innerText","logout");
			$('#account-action-mobile').prop("href","/logout");
			$('#username-string').prop("innerText", details.username);
			$('#avatar-image').prop("src","/images/avatars/" + details.avatar);
			$('#menu-open').removeClass("hide-on-large-only");
}

function restore_class(element) {
	var el = element.querySelector('.inner-notification');
	el.classList.remove('pulse');
	el.classList.remove('red');
	el.classList.add('orange');
	var item = $(element).data("itemid");
	var id = $(element).data("rssid");
	$.post("/feed/mark",{"id": id, "item": item})
	.done(function(response) {
		// console.log(JSON.stringify(response));
	})
	.fail(function(response){
		toast_alert(JSON.stringify(response.responseJSON.message));
	});
}


$(document).ready(function(){
	$('.sidenav').sidenav();
	$('.tap-target').tapTarget();
	$( "#menu-open" ).click(function() {
		$('.sidenav').sidenav('open');
	});
	$('.modal').modal({dismissible: false});
	$('select').formSelect();

	$( '#delete-modal-close' ).click(function() {
		// delete_feed(this.name);
		delete_feed({id: this["data-id"]});
		close_modal();
	});

	$( '#add-modal-close' ).click(function() {
		close_modal();
	});

	$( "#menu-open" ).click(function() {
		isAuthenticated(populateMenu);
	});

 	$('.notification-trigger').dropdown({});

	$( '#notification-button' ).click(function() {
	 	isAuthenticated(populateNotifications);
	});

	$( "#subscribe" ).click(function() {
		var instance = new feed();
		instance.url = $('#url').val();
		instance.title = $('#title').val();
		instance.description = $('#description').val();
		instance.website = $('#website').val();
		instance.category = $("#category-select").val();
		instance.favorite = $('#favourite-checkbox').prop('checked');
		instance.refresh = $('#refresh-range').val();

		if (this.type === "add"){
			create_feed(instance);
		} else if (this.type === "update"){
			// if use mongo ids are strings parseInt not needed
			// instance.id = parseInt(this.name);
			instance.id = this["data-id"];
			update_feed(instance);
		}

	});

	$( '#check-url' ).click(function() {
		var url = $('#url').val();
		if (url !== null || url !== ""){
			check_feed(url);
		}
	});

	$('#main-collapsible').collapsible({
		accordion: true,
		onOpenEnd: function (){
				fillCollapsible();
			},
		onCloseEnd: function(){
			isAuthenticated(updateFeeds);
		}
	});

	$("select").imagepicker();
	$(".select-dropdown.dropdown-trigger").hide();
	$('svg').hide();

	if (!isAuthenticated(displayUser)){
		$('#menu-open').addClass("hide-on-large-only");
		$('#account-action').prop("innerText","login");
		$('#account-action').prop("href","/login");
		$('#account-action-mobile').prop("innerText","login");
		$('#account-action-mobile').prop("href","/login");
	};

	setTimeout(function(){isAuthenticated(updateFeeds)}, 1000);

	setInterval(function(){
		isAuthenticated(updateFeeds);
	}, 30000);

});
