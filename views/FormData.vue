<template>
    <div>
        <base-header type="gradient-primary" class="pb-10 pb-8 pt-5 pt-md-8">
            <!-- Card stats -->

        </base-header>

        <div class="container-fluid mt--7">
            <div class="row">
                <div class="col">
                    <div class="card shadow">
                        <div class="card-header border-0 bg-transparent">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h3 class="mb-0" >
                                        {{tableName}}
                                    </h3>
                                </div>
                                <div class="col text-right">
                                    <router-link :to="{ name: 'forms' }"
                                                 class=" btn btn-secondary btn-icon-only rounded-circle mt-1">
                                        <i class="fa fa-arrow-left"></i>
                                    </router-link>
                                    <button  @click="showFunction()"
                                            class=" btn btn-primary text-white btn-icon-only rounded-circle mt-1"
                                            data-toggle="modal" data-target="#newDataEntry">
                                        <i class="fa fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-flush">
                                <thead class="thead-light">
                                <tr>
                                    <th v-for="(item, key, index) of heading">{{item.replace('_',' ')}}</th>
                                    <th class="text-center">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-if="!totalData">
                                    <td align="center" colspan="100%">No row found</td>
                                </tr>
                                <tr v-for="(item, id, index) of totalData">
                                    <td v-for="record of item">
                                        <div slot="showHtml" v-html="record">{{record}}</div>
                                    </td>
                                    <td class="text-center">
                                        <button type="button" @click="showData(id)"
                                                class=" btn btn-success  btn-sm btn-icon-only rounded-circle mt-1">
                                            <i class="fa fa-eye"></i></button>
                                        <button type="button" @click="editData(id)"
                                                class="btn btn-sm btn-primary btn-icon-only rounded-circle mt-1"><i
                                                class="fa fa-pencil-alt"></i></button>
                                        <button type="button" @click="deleteData(id)"
                                                class="btn btn-sm btn-danger btn-icon-only rounded-circle mt-1"><i
                                                class="fa fa-trash"></i></button>
                                    </td>
                                </tr>
                                </tbody>

                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <!-- Start New data record Modal -->
        <div class="modal fade" id="newDataEntry" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
             aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">{{popUpTitle}}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="data_key">
                        <form v-on:submit.prevent id="formRender">
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" id="save-data-btn" @click="saveNewEntry()">Save
                        </button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- End New data record Modal -->
    </div>
</template>
<script>
    window.$ = window.jQuery = require('jquery');
    var {db} = require('../config/db.js');
    import firebase from '../config/db.js';

    require('formBuilder/dist/form-render.min.js');
    require('formBuilder/dist/form-builder.min');
    require('bootstrap/dist/js/bootstrap.js');
    require('select2');

    var formBuilder;
    import swal from 'sweetalert2'

    export default {
        data() {
            return {
                showHtml: '',
                id: this.$router.currentRoute.params.id,
                list: [],
                heading: [],
                totalData: [],
                tableName: '',
                popUpTitle: 'New Entry'
            }
        },
        mounted: function () {
            this.getTableStructure();
        },
        methods: {
            getTableStructure: function () {
                var data = [];
                var field = [];

                var docRef = firebase.firestore().collection("tables").doc(this.id);

                var that = this;
                docRef.get().then(function (doc) {
                    if (doc.exists) {

                        that.tableName = doc.data().name;
                        that.heading = $.parseJSON(doc.data().heading);
                        field = doc.data().field;

                        var formData = field,
                            formRenderOpts = {
                                dataType: 'json',
                                formData: field
                            };

                        $.when($('#formRender').formRender(formRenderOpts)).then(function () {

                            //apply theme style of checkbox
                            $('input[type="checkbox"]').each(function () {
                                $(this).addClass('custom-control-input');
                                $(this).parent().addClass('custom-control custom-checkbox mb-3');
                                $(this).parent().find('label').addClass('custom-control-label')
                            });

                            //apply theme style of checkbox
                            $('input[type="radio"]').each(function () {
                                $(this).addClass('custom-control-input');
                                $(this).parent().addClass('custom-control custom-radio');
                                $(this).parent().find('label').addClass('custom-control-label')
                            });

                            $('select').select2({
                                multiple: false
                            });
                            $('.select2-selection__rendered').addClass('d-none');

                            that.getDataList()
                        });
                    } else {
                        // doc.data() will be undefined in this case
                        swal.fire({
                            text: 'No such document!',
                            type: "error",
                            icon: "error",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        that.$router.replace('Forms')
                    }
                }).catch(function (error) {
                    console.log("Error getting document:", error);
                });
            },
            getDataList: function () {

                var mainCollection = [];
                var that = this;

                var docRef = firebase.firestore().collection(this.id);
                docRef.onSnapshot((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        var collection = [];
                        collection['id'] = doc.id;
                        var allIteam = JSON.parse(doc.data().values);

                        $.each(allIteam, function (index, value) {
                            $.each(value, function (heading, value) {

                                if (heading in collection) {
                                    collection[heading] = collection[heading] + ', ' + value;
                                } else {
                                    collection[heading] = value;
                                }
                            });
                        });
                        mainCollection.push(collection)
                    });
                    var displayCollection = {};
                    $.each(mainCollection, function (key, val) {
                        var sample = {};

                        $.each(that.heading, function (index, title) {
                            if (title in val) {
                                sample[title] = val[title];
                            } else {
                                sample[title] = val[title + '[]'];
                            }
                        });
                        var id = val['id'];
                        displayCollection[id] = sample;
                    });
                    that.totalData = displayCollection;
                });

            },
            showData: function (data_key) {
                $('#newDataEntry').modal('show');
                var docRef = firebase.firestore().collection(this.id).doc(data_key);

                $('#data_key').val("");
                var data = [];
                var that = this;
                var tableList = db.ref('/data/' + this.id + '/' + data_key);
                $.when(docRef.get().then(function (doc) {
                    if (doc.exists) {
                        data = doc.data().values;
                    }
                })).then(function () {
                    $('#newDataEntry').find('input').prop('disabled', true);
                    that.popUpTitle = 'Show Entry';
                    $('#save-data-btn').addClass('d-none');
                    data = JSON.parse(data);
                    $('#newDataEntry').find('input[type="checkbox"]').prop('checked', false);
                    $.each(data, function (index, item) {
                        $.each(that.heading, function (index, title) {
                            if (title in item) {
                                if ($('#newDataEntry').find('#' + title).length) {
                                    var tagName = $('#newDataEntry').find('#' + title).prop("tagName");
                                    if (tagName == 'TEXTAREA') {
                                        $('#newDataEntry').find('textarea[name="' + title + '"]').text(item[title]);
                                        $('#newDataEntry').find('textarea[name="' + title + '"]').prop("disabled", true);
                                    } else if (tagName == 'SELECT') {
                                        $('#newDataEntry').find('#' + title + ' option[value=' + item[title] + ']').attr('selected', 'selected');
                                        $('#newDataEntry').find('#' + title).prop("disabled", true);
                                    }
                                }
                                if ($('#newDataEntry').find('input[name="' + title + '"]').length) {
                                    var type = $('#newDataEntry').find('input[name="' + title + '"]').prop("type");
                                    if (type == 'radio') {
                                        $('#newDataEntry').find('input[name="' + title + '"]').each(function () {
                                            if ($(this).val() == item[title]) {
                                                $(this).prop('checked', true);
                                            } else {
                                                $(this).prop('checked', false);
                                            }
                                        });
                                    } else {
                                        $('#newDataEntry').find('input[name="' + title + '"]').val(item[title]);
                                    }
                                }
                            } else {
                                title = title + '[]';
                                if (title in item) {
                                    $('#newDataEntry').find('input[name="' + title + '"]').each(function () {
                                        if ($(this).val() == item[title]) {
                                            $(this).prop('checked', true);
                                        }
                                    });
                                }
                            }
                        });
                    });

                    $('#newDataEntry').modal('show');
                });
            },
            editData: function (data_key) {
                $('#newDataEntry').modal('show');
                var docRef = firebase.firestore().collection(this.id).doc(data_key);
                var data = [];
                var that = this;
                $.when(docRef.get().then(function (doc) {
                    if (doc.exists) {
                        data = doc.data().values;
                    }
                })).then(function () {
                    that.showFunction();
                    data = JSON.parse(data);
                    $('#newDataEntry').find('input[type="checkbox"]').prop('checked', false);
                    that.popUpTitle = 'Update Entry';
                    $.each(data, function (index, item) {
                        $.each(that.heading, function (index, title) {
                            if (title in item) {
                                if ($('#newDataEntry').find('#' + title).length) {
                                    var tagName = $('#newDataEntry').find('#' + title).prop("tagName");
                                    if (tagName == 'TEXTAREA') {
                                        $('#newDataEntry').find('textarea[name="' + title + '"]').text(item[title]);
                                    } else if (tagName == 'SELECT') {
                                        $('#newDataEntry').find('#' + title + ' option[value=' + item[title] + ']').attr('selected', 'selected');
                                    }
                                }
                                if ($('#newDataEntry').find('input[name="' + title + '"]').length) {
                                    var type = $('#newDataEntry').find('input[name="' + title + '"]').prop("type");
                                    if (type == 'radio') {
                                        $('#newDataEntry').find('input[name="' + title + '"]').each(function () {
                                            if ($(this).val() == item[title]) {
                                                $(this).prop('checked', true);
                                            } else {
                                                $(this).prop('checked', false);
                                            }
                                        });
                                    } else {
                                        var type = $('#newDataEntry').find('input[name="' + title + '"]').prop("type");
                                        $('#newDataEntry').find('input[name="' + title + '"]').val(item[title]);
                                        if (type === 'hidden') {
                                            $('#newDataEntry').find('#' + title + '-input').val(item[title]);
                                        }
                                        /**/
                                    }
                                }
                            } else {
                                var data = title + '[]';
                                if (data in item) {
                                    $('#newDataEntry').find('input[name="' + data + '"]').each(function () {
                                        if ($(this).val() == item[data]) {
                                            $(this).prop('checked', true);
                                        }
                                    });
                                }
                            }
                        });
                    });

                    $('#newDataEntry').modal('show');

                    $('#data_key').val(data_key);
                });
            },
            deleteData: function (data_key) {
                var that = this;
                swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    type: "warning",
                    icon: "warning",
                    showCancelButton: !0,
                    confirmButtonColor: "#0CC27E",
                    cancelButtonColor: "#FF586B",
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "No, cancel!",
                    confirmButtonClass: "btn btn-success mr-5",
                    cancelButtonClass: "btn btn-danger",
                    buttonsStyling: !1
                }).then((result) => {
                    if (result.value) {
                        firebase.firestore().collection(that.id).doc(data_key).delete().then(function () {
                            swal.fire({
                                text: "Entry deleted successfully...",
                                icon: "success",
                                type: "success",
                                showConfirmButton: false,
                                timer: 1500
                            });
                            that.getDataList();
                        }).catch(function (error) {
                            swal.fire({
                                text: error,
                                type: "error",
                                icon: "error",
                                showConfirmButton: false,
                                timer: 1500
                            });
                        });
                    }
                });

            },
            saveNewEntry: function () {
                var newFormData = $('#formRender').serializeArray();

                var jsonObj = [];
                $.each(newFormData, function (key, val) {
                    var item = {};
                    item [val.name] = val.value;
                    jsonObj.push(item);
                });
                jsonObj = JSON.stringify(jsonObj);

                var data_key = $('#data_key').val();
                var that = this;
                if (data_key == '') {
                    firebase.firestore().collection(this.id).add({
                        values: jsonObj
                    }).then(function () {
                        swal.fire({
                            text: "New entry added successfully...",
                            icon: "success",
                            type: "success",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        that.getDataList();
                        $('#newDataEntry').modal('hide');
                    })
                        .catch(function (error) {
                            console.error(error);
                            $('#newDataEntry').modal('hide');
                        });
                } else {
                    firebase.firestore().collection(this.id).doc(data_key).set({
                        values: jsonObj
                    }).then(function () {
                        swal.fire({
                            text: "Entry update successfully...",
                            icon: "success",
                            type: "success",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        that.getDataList();
                        $('#newDataEntry').modal('hide');
                    }).catch(function (error) {
                        console.error(error);
                        $('#newDataEntry').modal('hide');
                    });
                }


            },
            showFunction: function () {
                $('#data_key').val("");
                $('#newDataEntry').modal('show');
                this.popUpTitle = 'New Entry';
                $('#newDataEntry').find('input').prop('disabled', false);
                $('#newDataEntry').find('select').prop("disabled", false);
                $('#newDataEntry').find('select').prop("selectedIndex", 0).val();
                $('#formRender').trigger("reset");
                $('#newDataEntry').find('textarea').prop("disabled", false);
                $('#newDataEntry').find('textarea').text('');
                $('#save-data-btn').removeClass('d-none');
            }
        }
    };
</script>
<style></style>
