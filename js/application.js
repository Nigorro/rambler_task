$(function () {
    $('input').on('click', function (){
        $('input').trigger("focus");
    });
    $('textarea').on('click', function (){
        $('textarea').trigger("focus");
    });
    $('#start').on('click', function (){
        i = 0;
        if ($('#start').data('start') == '0') {
            $('#start').data('start','1');
            $('body').addClass('dance');
            $('td').each(function (){
                if (i%2 == 0) {
                    $(this).addClass('shake1');
                }else{
                    $(this).addClass('shake1');
                };
                i = i + 1;
            })
        }else{
            $('#start').data('start', '0');
            $('body').removeClass('dance');
            $('td').each(function (){
                if (i%2 == 0) {
                    $(this).removeClass('shake1');
                }else{
                    $(this).removeClass('shake1');
                };
                i = i + 1;
            })
        };
    });
    var Event = Backbone.Model.extend({
        defaults:{
            date:'',
            title: ''
        }
    });

    var Events = Backbone.Collection.extend({
        model: Event,
        url: '/',
        initialize: function (){
            console.log('hello!');
        },
        getItems: function (data){
            this.fetch({
                data:data,
                success: function (){
                    console.log(items);
                }
            })
        }
    });
    var calendarEvents = [];

    var EventsView = Backbone.View.extend({
        initialize: function (){
            _.bindAll(this, 'addAll', 'select');
 
            this.collection.bind('reset', this.addAll);
        },
        render: function () {
            this.$el.fullCalendar({
                header: {
                    left: '',
                    center: 'title',
                    right: '',
                    ignoreTimezone: false
                },
                selectable: true,
                selectHelper: true,
                editable: true,
                select: this.select
            });
        },
        addAll: function (){
            this.el.fullCalendar('addEventSource', this.collection.toJSON());
        },
        select: function (startDate, endDate){
            new EventView().render();
        }
    });

    var  EventView = Backbone.View.extend({
        el: $('#eventDialog'),
        initialize: function (){
            _.bindAll(this);
        },
        render: function (){
            this.el.dialog({
                modal: true,
                title: 'New Event',
                buttons: {'Cancel': this.close}
            });
            return this;
        },
        close: function (){
            this.el.dialog('close');
        }
    })
    
    var addEvent = Backbone.View.extend({
        el: '.fc-day-number',
        events: {
            'click': 'showModal',
            'click .prev ': 'showContainer', 
            'click .deletBtn': 'deleteEvent',
            'click p': 'snowEdit',
            'click .saveEditble': 'editEvent'
        },
        initialize: function () {
            _.bindAll(this, 'render');
            this.render();
        },
        showModal: function (e) {
            try{
                
                var getClass = $(e.target).attr('class').split(' ');
            }
            catch(e) {
                var getClass = 'none';
            };
            if (getClass[0]==='fc-day-number'){
                var target = $(e.target);
                var body = $('body');
                if (target.data('check') !== 'dirty') {
                    modalWindow = this.setModal(target.offset(),target.data('date'));
                    modalWindow.removeClass('hide').addClass('active')
                }else{
                    console.log('Is dirty!');

                }
            }else{console.log('нет!')};
        },
        newEvent: function (e){
            console.log('New Event!');
        },
        showContainer: function (e){
            var pluse = $(e.target);
            var target = $(e.target).parent().find('.titleContainer');

            if (pluse.attr('class') === 'prev closed') {
                target.fadeIn();
                pluse.removeClass('closed').addClass('opened');
                pluse.text('-');
            }else if (pluse.attr('class') === 'prev opened') {
                target.fadeOut();
                pluse.removeClass('opened').addClass('closed');
                pluse.text('+');
            };
            
        },
        deleteEvent: function (e){ 
            el = $(e.target).parent().parent().parent().parent(); 
            date = el.data('date'); 
            el.data('check', '');
            $(e.target).parent().parent().parent().remove();
            this.collection.each(function( item ){
                console.log(item.collection.get('title'));
                if(item.get('date') === date){
                    console.log('bingo');
                    item.destroy();
                }
            });
        },
        editEvent: function(e){
            el = $(e.target).parent().parent().parent();
            text = $(e.target).parent().find('textarea').text();
            date = el.data('date');
            this.collection.each(function( item ){
                // item.get('title');
                if(item.get('date') === date){
                    console.log('bingo');
                    item.set('title', text);
                }
            });
            $(e.target).parent().find('textarea').remove();
            $(e.target).parent().find('.saveEditble').remove();

            el.find('p').css('display', 'block');

            
        },
        snowEdit: function(e){
            el = $(e.target);
            console.log(el);
            template = '<input id="edit" type="text" size="20 value = ' +  + '>1';
            template = '<textarea>'+el.text()+'</textarea><span class="saveEditble glyphicon glyphicon-floppy-disk"> Сохранить</span>'
            $(el[0]).after(template);
            $(el[0]).css('display', 'none');
            $('textarea').trigger("focus");
            // el.css('display', 'none');
            
        },
        setModal: function (pos, date) {
            var modal = $('#newEvent');
            var dateField = $('#newEvent #date');
            dateField.text(date);
            modal.css('top', pos.top-48);
            modal.css('left', pos.left-188);
            return modal;
        },
    });

    var saveEvent = Backbone.View.extend({
        el: '#newEvent',
        events: {
            'click #addEvent': 'addEvent'
        },
        addEvent: function (e){
            var title = $(this.el).find('#eventTitle').val();
            var date = $(this.el).find('#date').text();
            $(this.el).removeClass('active').addClass('hide');
            this.collection.add({'date': date,'title': title});
        }
    });

    var showEventContainer = Backbone.View.extend({
        el: '.eventContainer',
        events: {
            'click .prev': 'showContainer'
        },
        showContainer: function (){
            console.log($this.el);
        }
        
    });
    var events = new Events();
    events.bind('remove', function (e){
        console.log('Element was removed!');
    });
    events.bind('set', function (e){
        console.log('Collection was edit!');
    });
    events.bind('add', function (e){
        date = e.attributes.date;
        title = e.attributes.title;
        template = "<div class='eventContainer'>"+
                "<div class='prev closed'>+</div>"+
                    "<div class='titleContainer'> <div class='delete'><span class='deletBtn glyphicon glyphicon-trash'></span></div> <p>" +
                     title + "</p>"+
                    "</div></div>"
        $('.fc-day-number').each(function (index) {
            if ($(this).data('date') == date) {
                $(this).append(template);
                $(this).data('check','dirty');
            };
        });
    }) 
    new EventsView({el: $("#calendar"), collection: events}).render();
    events.fetch();
    new addEvent({collection: events});
    new saveEvent({collection: events});
});
