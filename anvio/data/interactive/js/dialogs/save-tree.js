/**
 *  Dialog for saving modified trees.
 *
 *  Author: Özcan Esen <ozcanesen@gmail.com>
 *  Credits: A. Murat Eren
 *  Copyright 2018, The anvio Project
 *
 * This file is part of anvi'o (<https://github.com/merenlab/anvio>).
 * 
 * Anvi'o is a free software. You can redistribute this program
 * and/or modify it under the terms of the GNU General Public 
 * License as published by the Free Software Foundation, either 
 * version 3 of the License, or (at your option) any later version.
 * 
 * You should have received a copy of the GNU General Public License
 * along with anvi'o. If not, see <http://opensource.org/licenses/GPL-3.0>.
 *
 * @license GPL-3.0+ <http://opensource.org/licenses/GPL-3.0>
 */


function SaveTreeDialog() {
    this.current_tree_name = last_settings['order-by'];

    this.dialog = document.createElement('div');
    this.dialog.setAttribute('class', 'modal fade in');

    this.dialog.innerHTML = `<div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button class="close" data-dismiss="modal" type="button"><span>&times;</span></button>
                    <h4 class="modal-title">Save Tree</h4>
                </div>

                <div class="modal-body">
                    <div class="col-md-12">
                        <label class="col-md-4 settings-label"><input type="radio" name="overwrite[]" value="no" checked="checked">Create new tree with name</label>  
                        <div class="col-md-8">
                            <input type="text" id="tree_name" value="New tree">
                        </div>
                    </div>
                    <div class="col-md-12">
                        <label class="col-md-4 settings-label"><input type="radio" name="overwrite[]" value="yes">Overwrite the current tree</label>  
                        <div class="col-md-8">
                            ${getClusteringPrettyName(this.current_tree_name)}
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary" data-dismiss="modal" type="button">Save</button>
                    <button class="btn btn-default" data-dismiss="modal" type="button">Close</button>
                </div>
            </div>
        </div>`;

    this.dialog.querySelector('.btn-primary').addEventListener('click', (event) => { this.SaveTree(); });
    this.dialog.querySelectorAll('input[type="radio"]').forEach((input) => { 
        input.addEventListener('click', (event) => { 
            if (this.dialog.querySelectorAll('input[type="radio"]')[0].checked) {
                this.dialog.querySelector('#tree_name').disabled = false;
            } else {
                this.dialog.querySelector('#tree_name').disabled = true;
            }
        })
    });

    $(this.dialog).modal('show').on('hidden.bs.modal', () => this.dialog.remove());
};


SaveTreeDialog.prototype.SaveTree = function() {
    let new_tree_name;

    if (this.dialog.querySelectorAll('input[type="radio"]')[0].checked) 
    {  
        // new tree combo selected
        let parts = this.current_tree_name.split(':');
        new_tree_name = this.dialog.querySelector('#tree_name').value + ':' + parts[1] + ':' + parts[2];
    } else {
        // overwrite selected
        new_tree_name = this.current_tree_name;
    }

    $.ajax({
        type: 'POST',
        cache: false,
        url: '/data/save_tree',
        data: {
            'name': new_tree_name,
            'data': clusteringData,
        },
        success: function(data) {
            
            $(this.dialog).modal('hide');
            this.dialog.remove();
        }.bind(this)
    });
};

