<template>
    <div>
        <base-header type="gradient-primary" class="pb-6 pb-8 pt-5 pt-md-8">
            <!-- Card stats -->

        </base-header>

        <div class="container-fluid mt--7">
            <div class="card card-profile shadow">
                <div class="card-header">
                    <div class="row">
                        <div class="col-12 col-sm-6 align-self-center"><h3 class="mb-0">New form</h3></div>
                        <div class="col-12 col-sm-6 text-right align-self-center">
                            <router-link :to="{ name: 'forms' }" class=" btn btn-secondary btn-icon-only rounded-circle mt-1">
                                <i class="fa fa-arrow-left"></i>
                            </router-link>
                            <button class=" btn btn-success text-white btn-icon-only rounded-circle mt-1" v-on:click="CreateForm()">
                                <i class="fas fa-save"></i>
                            </button>
                            <button class=" btn btn-danger text-white btn-icon-only rounded-circle mt-1" v-on:click="ClearForm()">
                                <i class="fas fa-eraser"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body pt-0 pt-md-4">
                    <div class="row">
                        <div class="col-12">
                            <div class="form-group" v-if="errors.length">
                                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                    <ul>
                                        <li v-for="error in errors">{{ error }}</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="form-group">
                                <base-input alternative="" required
                                            label="Form name"
                                            placeholder="Student Registration"
                                            input-classes="form-control-alternative"
                                            v-model="formName"
                                />

                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group" id="formBuilder">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
<script>

    /* eslint-disable */
    window.$ = window.jQuery = require('jquery');
    require('jquery-ui-sortable');
    window.$ = window.jQuery = require('jquery');
    import firebase from '../config/db.js';

    import swal from 'sweetalert2'
    require('formBuilder/dist/form-builder.min');
    var formBuilder;

    const {db} = require('../config/db.js');
    export default {
        name: 'forms',
        data() {
            return {
                errors: [],
                formName: '',
            }
        },
        mounted() {
            var options = {
                disableFields: ['file', 'header', 'hidden', 'paragraph', 'button'],
                disabledActionButtons: ['data', 'save', 'clear']
            };
            formBuilder = $('#formBuilder').formBuilder(options);

        },
        methods: {
            ClearForm: function () {
                formBuilder.actions.clearFields();
            },
            CreateForm: function () {
                var that = this;
                this.errors = [];
                if (this.formName == '') {
                    this.errors.push('Form name is required!');
                }
                var formData = formBuilder.actions.getData('json');

                var formHeading = [];

                if (JSON.parse(formData).length == 0) {
                    this.errors.push('Form structure is required!');
                } else {
                    $.each(JSON.parse(formData), function (key, val) {
                        formHeading.push(val.name)
                    });
                    formHeading = JSON.stringify(formHeading);

                }

                if (this.errors.length == 0) {
                    firebase.firestore().collection('tables').add({
                        name: this.formName,
                        field: formData,
                        heading: formHeading,
                    }).then(function() {
                        swal.fire({
                            text: "Form added successfully...",
                            type: "success",
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        that.$router.push({name: 'forms'})
                    })
                        .catch(function(error) {
                            console.error(error);
                        });
                }

            },
        }

    };
</script>
<style></style>
