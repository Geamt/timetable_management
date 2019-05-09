$(document).ready(function () {

    //Initializing json storage for time table
    var __time__table = {};
    var sems = {};
    var divisions = {};
    var days = {};
    var lecture_time_lists = {};


    $('#semester-list').children().each(function () {
        var id = $(this).attr('id');
        sems[id] = $(this).val()
    });
    $('#division-list').children().each(function () {
        var id = $(this).attr('id');
        divisions[id] = $(this).val()
    });
    $('#table_days').children().each(function () {
        var id = $(this).attr('id');
        days[id] = $(this).children().text();
    });
    $('#lecture-time-list').children().each(function () {
        var id = $(this).attr('id');
        lecture_time_lists[id] = $(this).val();
    });
    
    for (var sem_key in sems) {
        __time__table[sem_key] = { sem: sems[sem_key] }
        for (var div_key in divisions) {
            __time__table[sem_key][div_key] = { div: divisions[div_key] }
            for (var day_key in days) {
                __time__table[sem_key][div_key][day_key] = { day: days[day_key] }
                for (let l = 0; l < Object.entries(lecture_time_lists).length; l++) {
                    __time__table[sem_key][div_key][day_key][l] = {}
                }
            }
        }
    }
    var _lecture_break = '';
    var _lecture_time_list = '';
    var _faculty_list = '';
    var _class_lab_list = '';
    var _subject_list = '';
    ////////////////////////////////////////////////////////////////////


    //Method definition for Show popup
    function __showPopup() {
        $(".popup").removeClass("popup__invisible");
    }
    ////////////


    //Method definition Hide popup
    function __hidePopup() {
        $(".popup").addClass("popup__invisible");
    }
    ///////////


    //Method definition for hide some dropdowns for some reason :(
    function __hideSomeDropdowns() {
        $('#faculty-list').parent().parent().hide();
        $('#class-lab-list').parent().parent().hide();
        $('#subject-list').parent().parent().hide();
    }
    //////////////////////////////////////////////////////////////


    //Method definition for show some hidden dropdowns :)
    function __showSomeDropdowns() {
        $('#faculty-list').parent().parent().show();
        $('#class-lab-list').parent().parent().show();
        $('#subject-list').parent().parent().show();
    }
    ////////////////////////////////////////////////


    //Table cell click event
    $('.__table-body li').unbind().click(function () {

        let $clicked_cell = $(this);        //$clicked_cell as a last clicked table cell
        let $clicked_cell_index = $clicked_cell.index();        //Index of $clicked_cell

        let __json_sem_index = jsonDurationSemDivIndex()[0];
        let __json_div_index = jsonDurationSemDivIndex()[1];
        let __json_day_index = jsonDayIndex($clicked_cell);


        $('.__popup_incomplete_error').text('');

        if ($clicked_cell.html() === '') {
            //Setting up the default values to the dropdown while launching popup on click of cell
            $('#lecture-break').val(_lecture_break);
            $('#lecture-time-list').val(_lecture_time_list);
            $('#faculty-list').val(_faculty_list);
            $('#class-lab-list').val(_class_lab_list);
            $('#subject-list').val(_subject_list);
            //////////////////////////////////////////////////////////////////////


            __showSomeDropdowns();
        }
        else {

            let __breakorelse = $clicked_cell.children('span').eq(1).text();

            if (__breakorelse === "Break") {
                __hideSomeDropdowns();
                $('#lecture-break').val('Break');
                $('#lecture-time-list').val($clicked_cell.children('span').eq(0).text());
            }
            else {
                __showSomeDropdowns();

                $('#lecture-break').val('Lecture');
                $('#lecture-time-list').val($clicked_cell.children('span').eq(0).text());
                $('#faculty-list').val($clicked_cell.children('span').eq(1).text());
                $('#class-lab-list').val($clicked_cell.children('span').eq(2).text());
                $('#subject-list').val($clicked_cell.children('span').eq(3).text());
            }
        }


        //Time Validation for same day
        let __temp_arr_a = [];      //Array for store index of all previous elements of clicked element
        let __temp_arr_b = [];      //Array for store index of all nextl elements of clicked element
        let __max_time_index_a, __min_time_index_a;

        $('#lecture-time-list').children().each(function () {
            $(this).removeAttr('disabled');
        });

        function minMaxValFinderFromArray($startingIndex, $endingIndex, $arrayStorage = []) {
            for (let i = $startingIndex; i < $endingIndex; i++) {
                $('#lecture-time-list').children().each(function () {
                    let $__time_list__ = $(this);
                    if (__time__table[__json_sem_index][__json_div_index][__json_day_index][i].hasOwnProperty($__time_list__.attr('id'))) {
                        $arrayStorage.push($__time_list__.index());
                    }
                });
            }
            return $arrayStorage;
        }
        __temp_arr_a = minMaxValFinderFromArray(0, $clicked_cell_index, __temp_arr_a);
        __temp_arr_b = minMaxValFinderFromArray(($clicked_cell_index + 1), Object.entries(__time__table[__json_sem_index][__json_div_index][__json_day_index]).length - 1, __temp_arr_b);

        if (__temp_arr_a.length !== 0) {
            __max_time_index_a = Math.max.apply(Math, __temp_arr_a);

            for (let i = __max_time_index_a; i >= 0; i--) {
                $('#lecture-time-list').children().eq(i).attr('disabled', '');
            }
        }

        if (__temp_arr_b.length !== 0) {
            __min_time_index_a = Math.min.apply(Math, __temp_arr_b);

            for (let i = __min_time_index_a; i < $('#lecture-time-list').children().length; i++) {
                $('#lecture-time-list').children().eq(i).attr('disabled', '');
            }
        }
        ///////////////////////////////


        //Faculty and class/lab clashing solution
        $('#faculty-list').children().each(function () {
            $(this).removeAttr('disabled');
        });

        $('#class-lab-list').children().each(function () {
            $(this).removeAttr('disabled');
        });

        $(document).on('change', '#lecture-time-list', function () {
            let $__changed_time = $('option:selected',this).attr('id');
            $('#faculty-list').children().each(function () {
                $(this).removeAttr('disabled');
            });

            $('#class-lab-list').children().each(function () {
                $(this).removeAttr('disabled');
            });
            facultyClassLabClashing('#faculty-list', $__changed_time,1, $clicked_cell, $clicked_cell_index);
            facultyClassLabClashing('#class-lab-list', $__changed_time,2, $clicked_cell, $clicked_cell_index);
        });
        ///////////////////////////////////////////


        //Changing subject based on faculty if that faculty is already added in current table
        $(document).on('change', '#faculty-list', function () {
            let $__last_changed_faculty = $(this).attr('id');
            let $__same_subject = '';

            for (var day_key in days) {
                for (let j = 0; j < $('#lecture-time-list').children().length; j++) {
                    if (__time__table[sem_key][div_key][day_key][j].hasOwnProperty($__last_changed_faculty)) {
                        var key = Object.keys(__time__table[sem_key][div_key][__json_day_index][$clicked_cell_index])[3];
                        $__same_subject = key;
                    }
                }
            }

            if ($__same_subject === '') {
                for (var day_key in days) {
                    for (let j = 0; j < $('#lecture-time-list').children().length; j++) {
                        if (__time__table[sem_key][div_key][day_key][j].hasOwnProperty($__last_changed_faculty)) {
                            var key = Object.keys(__time__table[sem_key][div_key][__json_day_index][$clicked_cell_index])[3];
                            $__same_subject = key;
                            break;
                        }
                    }
                }
            }

            $('#subject-list').val($__same_subject);
            //$("#subject-list option[id="+$__same_subject+"]").attr("selected","selected");
        });
        //////////////////////////////////////////////////////////////////////////////////////


        __showPopup();        //showing popup

        setDetails($clicked_cell, $clicked_cell_index);      //Function call for set selected details from dropdown to clicked cell
    });
    ///////////////////////////////////////////


    //Method definition for solution of faculty/class/lab clashing at same time
    function facultyClassLabClashing($__dropdown_id__, $__this__,$__json_dis_index__, $clicked_cell, $clicked_cell_index) {
        //let __json_winsum_index = jsonDurationSemDivIndex()[0];
        let __json_day_index = jsonDayIndex($clicked_cell);
        let __temp_arr = [];

        //console.log($__this__);
        for (var sem_key in sems) {
            for (var div_key in divisions) {
                if (__time__table[sem_key][div_key][__json_day_index][$clicked_cell_index].hasOwnProperty($__this__)) {
                    var key = Object.keys(__time__table[sem_key][div_key][__json_day_index][$clicked_cell_index])[$__json_dis_index__];
                    __temp_arr.push(key);
                }
            }
        }
        
        if (__temp_arr.length !== 0) {
            var count = 0;
            for (let i = 0; i < __temp_arr.length; i++) {
                $($__dropdown_id__).children().each(function () {
                    let $__current_obj = $(this);
                    if ($__current_obj.attr('id') === __temp_arr[i]) {
                        $(this).prop('disabled',true);
                    }
                });
            }
            $($__dropdown_id__).val('');
        }
    }
    ///////////////////////////////////////////////////////////////////////////


    //Hide popup on click of cancel button
    $('#popup_btn_cancel').unbind().click(function () {
        __hidePopup();
    });
    //////////////////////////////////////


    //Lecture or Break dropdown change event
    $(document).on('change', '#lecture-break', function () {
        let lectureorbreak = $(this).val();
        if (lectureorbreak === "Break") {
            __hideSomeDropdowns();
        }
        else {
            __showSomeDropdowns();
        }
    });
    ////////////////////////////////////////


    //Method definition for setting details to the clicked cell 
    function setDetails($clicked_cell, $clicked_cell_index) {
        $('#popup_btn_okay').unbind().click(function () {

            if (($('#lecture-break').val() === null) || ($('#lecture-time-list').val() === null) || ($('#lecture-break').val() === null) || ($('#lecture-time-list').val() === null) || ($('#lecture-break').val() === null)) {
                $('.__popup_incomplete_error').text('All dropdowns are compulsory!');
            }
            else {
                let _html_content = '';
                let __temp__json__obj = {};
                let __sem_index = $('option:selected', '#semester-list').attr('id');
                let __div_index = $('option:selected', '#division-list').attr('id');
                let __day_index = $clicked_cell.parent().prev().children().children().attr('id');

                $('.__popup_incomplete_error').text('');


                //Storing selected details in temporary json array
                if ($('#lecture-break').val() === "Lecture") {
                    __temp__json__obj[$('option:selected', '#lecture-time-list').attr('id')] = { time: $('#lecture-time-list').val() };//$('#lecture-time-list').val();
                    __temp__json__obj[$('option:selected', '#faculty-list').attr('id')] = { faculty: $('#faculty-list').val() };//$('#faculty-list').val();
                    __temp__json__obj[$('option:selected', '#class-lab-list').attr('id')] = { class: $('#class-lab-list').val() };//$('#class-lab-list').val();
                    __temp__json__obj[$('option:selected', '#subject-list').attr('id')] = { subject: $('#subject-list').val() };//$('#subject-list').val();
                }
                else {
                    __temp__json__obj[$('option:selected', '#lecture-time-list').attr('id')] = { time: $('#lecture-time-list').val() };//$('#lecture-time-list').val();
                    __temp__json__obj['break'] = "Break";
                }
                ///////////////////////////////////////////////////





                //Shifting values from temporary json to __time__table json array 
                __time__table[__sem_index][__div_index][__day_index][$clicked_cell_index] = [];
                __time__table[__sem_index][__div_index][__day_index][$clicked_cell_index] = __temp__json__obj;
                /////////////////////////////////////////////////////////////////


                //Retriving values from __time__table and being stored in html element to display the details
                var content = Object.values(__time__table[__sem_index][__div_index][__day_index][$clicked_cell_index]);
                if (__time__table[__sem_index][__div_index][__day_index][$clicked_cell_index].hasOwnProperty('break')) {
                    $clicked_cell.attr('class', '');
                    $clicked_cell.addClass('break-info');
                    _html_content = '<span>' + content[0]['time'] + '</span><span>' + content[1] + '</span>';
                }
                else {
                    $clicked_cell.attr('class', '');
                    $clicked_cell.addClass('lecture-info');
                    _html_content = '<span>' + content[0]['time'] + '</span><span>' + content[1]['faculty'] + '</span><span>' + content[2]['class'] + '</span><span>' + content[3]['subject'] + '</span>';
                }

                $clicked_cell.html(_html_content);
                //////////////////////////////////////////////////////////////////////////////////////////////


                __hidePopup();      //Hide popup after the completion of process
            }
        });
    }
    ////////////////////////////////////////////////////////////


    //Method definition for getting & passing selected values from dropdowns to other methods
    function getSelectedDropdownVal() {
        let _semester_ = $('option:selected', '#semester-list').attr('id');
        let _division_ = $('option:selected', '#division-list').attr('id');
        return [_semester_, _division_];
    }
    /////////////////////////////////////////////////////////////////////////////////////////


    //Duaration-Type dropdown change event
    /*$(document).on('change', '#duration-list', function () {

        //Snippet for change the dropdown values for semester based on winter or summer
        let $this = $(this);
        let winterorsummer = $(this).val();

        if (winterorsummer === "Winter") {
            $this.parent().next().html('Semester : <select id="semester-list"><option>1</option><option>3</option><option>5</option><option>7</option><option>9</option></select>');
        }
        else {
            $this.parent().next().html('Semester : <select id="semester-list"><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option></select>');
        }
        ///////////////////////////////////////////////////////////////////////////////


        displayFromJsonToHtml();
    });*/
    //////////////////////////////////////


    //Semester dropdown change event
    $(document).on('change', '#semester-list', function () {
        displayFromJsonToHtml();
    });
    ////////////////////////////////


    //Division dropdown change event
    $(document).on('change', '#division-list', function () {
        displayFromJsonToHtml();
    });
    ////////////////////////////////


    //Method definition for finding index of winter/summer in json array
    function jsonDurationSemDivIndex() {
        let __sem_index = getSelectedDropdownVal()[0];
        let __div_index = getSelectedDropdownVal()[1];

        return [__sem_index, __div_index];
    }
    ////////////////////////////////////////////////////////////////////////


    //Method definition for finding index of perticular day in json array
    function jsonDayIndex($clicked_cell) {
        let __day_index = $clicked_cell.parent().prev().children().children().attr('id');
        return __day_index;
    }
    ////////////////////////////////


    //Method definition for fetching and setting data from __time__table json array to html elements
    function displayFromJsonToHtml() {
        //Setting up the index of selected day to the variable to store the data from __time__table json array to html elements
        let __json_sem_index = jsonDurationSemDivIndex()[0];
        let __json_div_index = jsonDurationSemDivIndex()[1];
        let day_for_data = [];
        for (day_key in days) {
            day_for_data.push(day_key)
        }

        //let day_for_data = days.values;
        let i = 0;
        let __day_index = day_for_data[i++];
        $('ul.__table-body').each(function () {
            let $__table_body = $(this);

            $__table_body.children('li').each(function () {
                let $__table_body_li = $(this);
                $__table_body_li.attr('class', '');

                if (Object.entries(__time__table[__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()]).length === 0) {
                    $__table_body_li.html('');
                }
                else {
                    var content = Object.values(__time__table[__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()]);
                    if (content.length === 2) {
                        $__table_body_li.addClass('break-info');
                        $__table_body_li.html('<span>' + content[0]['time'] + '</span><span>' + content[1] + '</span>');
                    }
                    else if (content.length === 4) {
                        $__table_body_li.addClass('lecture-info');
                        $__table_body_li.html('<span>' + content[0]['time'] + '</span><span>' + content[1]['faculty'] + '</span><span>' + content[2]['class'] + '</span><span>' + content[3]['subject'] + '</span>');
                    }
                }
            });
            __day_index = day_for_data[i++];
        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////


    //Export button click event
    $('#btn_export').unbind().click(function () {     //Export the json array of current selected duration time table
        const duration = $('option:selected', '#duration-list').attr('id');
        const time_table = __time__table
        //console.log([time_table]);
        $.ajax({
            url: "http://localhost:3000/scheduler/add_timetable",
            method:"POST",
            data :{ duration : duration , tt : JSON.stringify(time_table) },
            success : function(data){
                if(data['status']==200)
                {
                    swal("Good job!", "Time table generated successfully !", "success");
                
                }
                else
                {
                    swal('Oops!', 'Something goes wrong!', 'warning');
                }
            }
        })
        //console.log(__time__table);

    });
    ///////////////////////////


    //Snippet for behaviour of elements for responsive design
    $(window).on('resize', function () {
        if (window.innerWidth <= "858") {
            $('.__time-table .__table-body').each(function () {
                $(this).hide();
            });

            $('.__table-body').eq(0).show();
        }
        else {
            $('.__time-table .__table-body').each(function () {
                $(this).show();
            });
        }
    });

    $('.__time-table .__table-heading-small-device').unbind().click(function () {
        let $this = $(this);

        $('.__time-table .__table-body').each(function () {
            $(this).hide();
        });

        $this.next().show();
    });
    //////////////////////////////////////////////////////////    
});