import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import * as _ from 'lodash';
  
const ITEM_HEIGHT = 48;

interface EditMenuProps {
    row: any;
    onDeleteSuccess: (_id: string) => void;
    onDuplicateSuccess: (newRow: any) => void;
    onEditSuccess: (newRow: any) => void;
}

export default function LongMenu(props: EditMenuProps) {

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
  
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
  
    const handleClose = (event: React.MouseEvent, _id: string) => {

        setDeleteDialogOpen(false);
        setEditDialogOpen(false);

        if (event && event.currentTarget.textContent === 'Delete') {
            setDeleteDialogOpen(true);
        } else if (event.currentTarget.textContent === 'Duplicate') {
            duplicateRow(_id);
        } else if (event.currentTarget.textContent === 'Edit') {
            setEditDialogOpen(true);
        }

        setAnchorEl(null);
    };

    const editRow = () => {
        setEditDialogOpen(false);
        try {
            axios.post((process.env.REACT_APP_API_URL + 'update'), props.row).then(res => {
                if (res.data.errors) {
                    // raise error
                } else {
                    console.log(`Row was saved`);

                    // report back to parent component
                    props.onEditSuccess(props.row);
                }
            })
        } catch (e) {
            console.log(`Error with saving row after edit`);
        }
    }

    const deleteRow = (_id: string) => {
        setDeleteDialogOpen(false);
        try {
            axios.post((process.env.REACT_APP_API_URL + 'delete'), { _ids: [_id]}).then(res => {
                if (res.data.errors) {
                    // raise error
                } else {
                    console.log(`deleted ${_id}!`);

                    // report back to parent component
                    props.onDeleteSuccess(_id);
                }
            })
        } catch (e) {
            console.log(`Error with deleting row with id ${_id}.`);
        }
    }
    
    const duplicateRow = (_id: string) => {
        try {
            axios.post((process.env.REACT_APP_API_URL + 'duplicate'), { _id: _id}).then(res => {
                if (res.data.errors) {
                    // raise error
                } else {
                    console.log(`duplicated ${_id}!`);
                    // report back to parent component
                    props.onDuplicateSuccess(res.data);
                }
            })
        } catch (e) {
            console.log(`Error with deleting row with id ${_id}.`);
        }
    }
  
    return (
      <div>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: '20ch',
            },
          }}
        >
            <MenuItem key={"Edit"} onClick={(event: any) => handleClose(event, props.row._id)}>
              {"Edit"}
            </MenuItem>
            <Dialog open={editDialogOpen} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Edit data</DialogTitle>
                {_.keys(props.row).filter(property => property !== "_id").map((property: any) => {
                    return (
                        <DialogContent>
                            <TextField autoFocus margin="dense" id={property} 
                            onChange={(newValue) => {props.row[property] = newValue.target.value}}
                            label={property} type={property} fullWidth defaultValue={props.row[property]} />
                        </DialogContent>
                    )
                })}
                <DialogActions>
                    <Button onClick={(event) => handleClose(event, props.row._id)} color="primary">
                        Cancel
                    </Button>
                    <Button color="primary" onClick={() => editRow()}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
    
            <MenuItem key={"Duplicate"} onClick={(event: any) => handleClose(event, props.row._id)}>
              {"Duplicate"}
            </MenuItem>
            <MenuItem key={"Delete"} onClick={(event: any) => handleClose(event, props.row._id)}>
              {"Delete"}
            </MenuItem>
            <Dialog open={deleteDialogOpen} onClose={handleClose}
            aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{"Approve action"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this row?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={(event: any) => handleClose(event, props.row._id)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={(event: any) => deleteRow(props.row._id)} color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Menu>
      </div>
    );
}