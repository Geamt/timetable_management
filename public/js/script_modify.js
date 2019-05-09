
checkDuration = function () {
    var duration = $("#duration-list").children().attr('id');
    $.ajax({
        url: "http://localhost:3000/scheduler/check_duration",
        method: "post",
        data: { duration: duration },
        success: function (data) {

            var status = data["status"];
            //alert(status);
            if (status == 200) {
                allow = true;
            } else {
                allow = false;
                //alert("This duration already exist");             
            }
            //console.log(allow);
        }
    });
}
$(document).ready(function () {


    //Initializing json storage for time table
    var __time__table = [];
    var allow = false;
    for (let i = 0; i < $('#duration-list').children().length; i++) {
        __time__table.push([]);
        for (let j = 0; j < $('#semester-list').children().length; j++) {
            __time__table[i].push([]);
            for (let k = 0; k < $('#division-list').children().length; k++) {
                __time__table[i][j].push([]);
                for (let l = 0; l < 6; l++) {
                    __time__table[i][j][k].push([]);
                    for (let m = 0; m < $('#lecture-time-list').children().length; m++) {
                        __time__table[i][j][k][l].push([]);
                    }
                }
            }
        }
    }
    //////////////////////////////////////////


    //Storing default values of all dropdowns on document ready for later use
    var _duration_list = '';
    var _semester_list = '';
    var _division_list = '';
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


        $('.__popup_incomplete_error').text('');
        $('#lecture-break').val(_lecture_break);
        $('#lecture-time-list').val(_lecture_time_list);
        $('#faculty-list').val(_faculty_list);
        $('#class-lab-list').val(_class_lab_list);
        $('#subject-list').val(_subject_list);
        if (!allow) {
            var duration = $("#duration-list").children().attr('id');
            $.ajax({
                url: "http://localhost:3000/scheduler/check_duration",
                method: "post",
                data: { duration: duration },
                success: function (data) {

                    var status = data["status"];
                    //alert(status);
                    if (status == 200) {
                        allow = true;
                        __showPopup();
                    } else {
                        allow = false;
                        //alert("This duration already exist");             
                    }
                    //console.log(allow);
                }
            });
        }
        else { 
            __showPopup();
        }

        //setDetails($clicked_cell, $clicked_cell_index);      //Function call for set selected details from dropdown to clicked cell
    });
    ///////////////////////////////////////////


    //Method definition for solution of faculty/class/lab clashing at same time
    function facultyClassLabClashing($__dropdown_id__, $__this__, $__json_time_index__, $__json_faculty_index__, $clicked_cell, $clicked_cell_index) {
        let __json_winsum_index = jsonDurationSemDivIndex()[0];
        let __json_day_index = jsonDayIndex($clicked_cell);
        let __temp_arr = [];

        for (let i = 0; i < $('#semester-list').children().length; i++) {
            for (let j = 0; j < $('#division-list').children().length; j++) {
                if (__time__table[__json_winsum_index][i][j][__json_day_index][$clicked_cell_index].length === 4) {
                    if (__time__table[__json_winsum_index][i][j][__json_day_index][$clicked_cell_index][$__json_time_index__] === $__this__.val()) {
                        __temp_arr.push(__time__table[__json_winsum_index][i][j][__json_day_index][$clicked_cell_index][$__json_faculty_index__]);
                    }
                }
            }
        }
        if (__temp_arr.length !== 0) {
            for (let i = 0; i < __temp_arr.length; i++) {
                $($__dropdown_id__).children().each(function () {
                    let $__current_obj = $(this);
                    if ($__current_obj.text() === __temp_arr[i]) {
                        $__current_obj.attr('disabled', '');
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
                let __temp__json__obj = [];
                let __arr_sem_win = ["1", "3", "5", "7", "9"];
                let __arr_sem_sum = ["2", "4", "6", "8", "10"];
                let __arr_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                let __win_sum_index, __sem_index, __div_index, __day_index;

                $('.__popup_incomplete_error').text('');


                //Storing selected details in temporary json array
                if ($('#lecture-break').val() === "Lecture") {
                    __temp__json__obj[0] = $('#lecture-time-list').val();
                    __temp__json__obj[1] = $('#faculty-list').val();
                    __temp__json__obj[2] = $('#class-lab-list').val();
                    __temp__json__obj[3] = $('#subject-list').val();
                }
                else {
                    __temp__json__obj[0] = $('#lecture-time-list').val();
                    __temp__json__obj[1] = "Break";
                }
                ///////////////////////////////////////////////////


                //Setting up the index of winter or summer and selected semester to the variables to store the data in __time__table json array
                if ($('#duration-list').val() === "Winter") {
                    __win_sum_index = 0;
                    for (let i = 0; i < __arr_sem_win.length; i++) {
                        if ($('#semester-list').val() === __arr_sem_win[i]) {
                            __sem_index = i;
                            break;
                        }
                    }
                }
                else if ($('#duration-list').val() === "Summer") {
                    __win_sum_index = 1;
                    for (let i = 0; i < __arr_sem_sum.length; i++) {
                        if ($('#semester-list').val() === __arr_sem_sum[i]) {
                            __sem_index = i;
                            break;
                        }
                    }
                }
                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


                //Setting up the index of selected division to the variable to store the data in __time__table json array
                if ($('#division-list').val() === "A") {
                    __div_index = 0;
                }
                else if ($('#division-list').val() === "B") {
                    __div_index = 1;
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////


                //Setting up the index of selected day to the variable to store the data in __time__table json array
                for (let i = 0; i < __arr_days.length; i++) {
                    if ($clicked_cell.parent().prev().children().children().text() === __arr_days[i]) {
                        __day_index = i;
                        break;
                    }
                }
                ////////////////////////////////////////////////////////////////////////////////////////////////////


                //Shifting values from temporary json to __time__table json array 
                __time__table[__win_sum_index][__sem_index][__div_index][__day_index][$clicked_cell_index] = [];
                __time__table[__win_sum_index][__sem_index][__div_index][__day_index][$clicked_cell_index] = __temp__json__obj;
                /////////////////////////////////////////////////////////////////


                //Retriving values from __time__table and being stored in html element to display the details
                if (__time__table[__win_sum_index][__sem_index][__div_index][__day_index][$clicked_cell_index][1] === "Break") {
                    $clicked_cell.attr('class', '');
                    $clicked_cell.addClass('break-info');
                    _html_content = '<span>' + __time__table[__win_sum_index][__sem_index][__div_index][__day_index][$clicked_cell_index][0] + '</span><span>' + __time__table[__win_sum_index][__sem_index][__div_index][__day_index][$clicked_cell_index][1] + '</span>';
                }
                else {
                    $clicked_cell.attr('class', '');
                    $clicked_cell.addClass('lecture-info');
                    _html_content = '<span>' + __time__table[__win_sum_index][__sem_index][__div_index][__day_index][$clicked_cell_index][0] + '</span><span>' + __time__table[__win_sum_index][__sem_index][__div_index][__day_index][$clicked_cell_index][1] + '</span><span>' + __time__table[__win_sum_index][__sem_index][__div_index][__day_index][$clicked_cell_index][2] + '</span><span>' + __time__table[__win_sum_index][__sem_index][__div_index][__day_index][$clicked_cell_index][3] + '</span>';
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
        let _winorsum_ = $('#duration-list').val();
        let _semester_ = $('#semester-list').val();
        let _division_ = $('#division-list').val();

        /*console.log("duration : "+_winorsum_);
        console.log("semester : "+_semester_);
        console.log("division : "+_division_);*/

        return [_winorsum_, _semester_, _division_];
    }
    /////////////////////////////////////////////////////////////////////////////////////////


    //Duaration-Type dropdown change event
    $(document).on('change', '#duration-list', function () {
        let duration;
        //Snippet for change the dropdown values for semester based on winter or summer
        let $this = $(this);
        let winterorsummer = $(this).val();
        if (winterorsummer === "Winter") {
            duration = 1
        }
        else {
            duration = 2
        }
        $.ajax({
            url: "http://localhost:3000/scheduler/get_sems_of_duration",
            method: "post",
            data: { duration: duration },
            success: function (data) {

                var status = data["status"];
                var sems = "";
                var clss = "";
                if (status == 200) {
                    sems = 'Semester : <select id="semester-list">';
                    data['sems'].forEach(sem => {
                        sems = sems + "<option id=" + sem['_id'] + ">" + sem['sem'] + "</option>";
                    });
                    sems = sems + "</select>"
                    $this.parent().next().html(sems)

                    data['clss'].forEach(cls => {
                        clss = clss + '<option id=' + cls['_id'] + '>' + cls['class'] + '</option>'
                    });

                    $("#division-list").html(clss);
                    displayFromJsonToHtml();
                } else {

                }
            }
        });

        /*if (winterorsummer === "Winter") {
            $this.parent().next().html('Semester : <select id="semester-list"><option>1</option><option>3</option><option>5</option><option>7</option><option>9</option></select>');
        }
        else {
            $this.parent().next().html('Semester : <select id="semester-list"><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option></select>');
        }*/
        ///////////////////////////////////////////////////////////////////////////////



    });
    //////////////////////////////////////


    //Semester dropdown change event
    $(document).on('change', '#semester-list', function () {
        var sem = $('#semester-list option:selected').attr('id');
        var clss = "";
        $.ajax({
            url: "http://localhost:3000/scheduler/get_classes_by_sem",
            method: "post",
            data: { sem: sem },
            success: function (data) {

                var status = data["status"];
                //alert(status);
                if (status == 200) {
                    data['clss'].forEach(cls => {
                        clss = clss + '<option id=' + cls['_id'] + '>' + cls['c lass'] + '</option>'
                    });

                    $("#division-list").html(clss);
                    displayFromJsonToHtml();
                } else {
                    alert("Something Goes Wrong");
                    //$(".username").removeClass("has-error");
                }
            }
        });

    });
    ////////////////////////////////


    //Division dropdown change event
    $(document).on('change', '#division-list', function () {
        displayFromJsonToHtml();
    });
    ////////////////////////////////


    //Method definition for finding index of winter/summer in json array
    function jsonDurationSemDivIndex() {
        let __arr_sem_win = ["1", "3", "5", "7", "9"];
        let __arr_sem_sum = ["2", "4", "6", "8", "10"];
        let __win_sum_index, __sem_index, __div_index;

        //Setting up the index of winter or summer and selected semester to the variables to set the data from __time__table json array to html elements
        if (getSelectedDropdownVal()[0] === "Winter") {
            __win_sum_index = 0;
            for (let i = 0; i < __arr_sem_win.length; i++) {
                if (getSelectedDropdownVal()[1] === __arr_sem_win[i]) {
                    __sem_index = i;
                    break;
                }
            }
        }
        else if (getSelectedDropdownVal()[0] === "Summer") {
            __win_sum_index = 1;
            for (let i = 0; i < __arr_sem_sum.length; i++) {
                if (getSelectedDropdownVal()[1] === __arr_sem_sum[i]) {
                    __sem_index = i;
                    break;
                }
            }
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //Setting up the index of selected division to the variable to store the data from __time__table json array to html elements
        if (getSelectedDropdownVal()[2] === "A") {
            __div_index = 0;
        }
        else if (getSelectedDropdownVal()[2] === "B") {
            __div_index = 1;
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////
        return [__win_sum_index, __sem_index, __div_index];


    }
    ////////////////////////////////////////////////////////////////////////


    //Method definition for finding index of perticular day in json array
    function jsonDayIndex($clicked_cell) {
        let __day_index;
        let __day_arr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        for (let i = 0; i < __day_arr.length; i++) {
            if ($clicked_cell.parent().prev().children().children().text() === __day_arr[i]) {
                __day_index = i;

            }

        }
        return __day_index;
    }
    ////////////////////////////////


    //Method definition for fetching and setting data from __time__table json array to html elements
    function displayFromJsonToHtml() {
        //Setting up the index of selected day to the variable to store the data from __time__table json array to html elements
        let __json_winsum_index = jsonDurationSemDivIndex()[0];
        let __json_sem_index = jsonDurationSemDivIndex()[1];
        let __json_div_index = jsonDurationSemDivIndex()[2];
        let __day_index = 0;
        $('ul.__table-body').each(function () {
            let $__table_body = $(this);

            $__table_body.children('li').each(function () {
                let $__table_body_li = $(this);
                $__table_body_li.attr('class', '');
                if (__time__table[__json_winsum_index][__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()].length === 0) {
                    $__table_body_li.html('');
                }
                else {
                    if (__time__table[__json_winsum_index][__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()].length === 2) {
                        $__table_body_li.addClass('break-info');
                        $__table_body_li.html('<span>' + __time__table[__json_winsum_index][__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()][0] + '</span><span>' + __time__table[__json_winsum_index][__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()][1] + '</span>');
                    }
                    else if (__time__table[__json_winsum_index][__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()].length === 4) {
                        $__table_body_li.addClass('lecture-info');
                        $__table_body_li.html('<span>' + __time__table[__json_winsum_index][__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()][0] + '</span><span>' + __time__table[__json_winsum_index][__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()][1] + '</span><span>' + __time__table[__json_winsum_index][__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()][2] + '</span><span>' + __time__table[__json_winsum_index][__json_sem_index][__json_div_index][__day_index][$__table_body_li.index()][3] + '</span>');
                    }
                }
            });
            __day_index = __day_index + 1;
        });
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////


    //Export button click event
    $('#btn_export').unbind().click(function () {     //Export the json array of current selected duration time table
        let __json_winsum_index = jsonDurationSemDivIndex()[0];
        let __exported_json_data = __time__table[__json_winsum_index];
        console.log(__json_winsum_index);
        console.log(__exported_json_data);

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

    //semester change
    /*$(document).on('change', '#semester-list', function () {
        var sem = $('#semester-list option:selected').attr('id');
        var clss = "";
        $.ajax({
            url: "http://localhost:3000/scheduler/get_classes_by_sem",
            method: "post",
            data: { sem: sem },
            success: function (data) {

                var status = data["status"];
                //alert(status);
                if (status == 200) {
                    data['clss'].forEach(cls => {
                        clss = clss + '<option id='+cls['_id']+'>'+cls['c lass']+'</option>'
                    });
                    
                    $("#division-list").html(clss);
                    
                } else {
                    alert("Something Goes Wrong");
                    //$(".username").removeClass("has-error");
                }
            }
        });
    });*/
});