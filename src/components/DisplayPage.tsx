import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'
import React, { Fragment } from 'react';
import axios from 'axios';
import _ from 'lodash';
import './DisplayPage.css';
import Promotions from './PromotionsDisplay';
import { timer } from 'rxjs';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant='filled' {...props} />;
}

export interface IState {
    rows: Array<any>;
    columns: Array<string>;
    backdropOpen: boolean;
    successSnackbarOpen: boolean;
    errorSnackbarOpen: boolean;
    dataGenerateDialogOpen: boolean;
    noData: boolean;
}

export default class DisplayPage extends React.Component {

    state: IState;

    constructor(props: any) {
        super(props);
        this.state = {
            rows: [],
            columns: [],
            backdropOpen: false,
            successSnackbarOpen: false,
            errorSnackbarOpen: false, 
            dataGenerateDialogOpen: false,
            noData: false
        }
    }

    public async componentWillMount() {
        // Load data periodically
        timer(0, 30000).subscribe(res => {
            this.getData();
        });
    }

    public getData(): Promise<any> {
        return axios.get(process.env.REACT_APP_API_URL + 'get').then(res => {
            this.setState({backdropOpen: false});
            if (res.data.length === 0) {
                this.setState({noData: true});
            } else {
                this.setState({noData: false});
                let response = res.data.map((x: any) => {
                    delete x.__v;
                    return x;
                });

                // Sorting which relies on the existence of "Name" property -
                // just so it is easy to check the deletion and duplication actions
                response.sort((a: any, b: any) => (a.Name.toLowerCase()) > (b.Name.toLowerCase()) ? 1 : -1);

                this.setState({rows: response});
                const firstrecord = _.keys(this.state.rows[0]);
                this.setState({columns: firstrecord});  
                this.setState({errorSnackbarOpen: false});
            }
        }).catch((error) => {
            this.setState({errorSnackbarOpen: true});
            console.log(`Error while fetching data: ${error.message}`);
        });   
    }

    public onStateChange() {
        this.setState({successSnackbarOpen: true});
        this.setState({backdropOpen: true});
        this.getData().then(() => this.setState({backdropOpen: false}));
    }

    public generateNewData() {
        this.setState({dataGenerateDialogOpen: false});
        this.setState({backdropOpen: true});
        return axios.get(process.env.REACT_APP_API_URL + 'create')
        .then(() => {
            this.setState({backdropOpen: false});
            this.getData();
        })
        .catch((error) => {
            this.setState({errorSnackbarOpen: true});
            console.log(`Error while trying to generate data: ${error.message}`);
        })
    }

    public onDeleteSelected(selectedIds: Map<string, boolean>) {
        let keys = Array.from(selectedIds.keys());
        try {
            axios.post((process.env.REACT_APP_API_URL + 'delete'), { _ids: keys}).then(res => {
                if (res.data.errors) {
                    this.setState({errorSnackbarOpen: true});
                    console.log(`Error with deleting rows: ${res.data.errors}`);
                } else {
                    this.onStateChange();
                }
            })
        } catch (e) {
            this.setState({errorSnackbarOpen: true});
            console.log(`Error with deleting rows: ${e.message}`);
        }
    }

    public render() {

        const loaded = this.state.columns.length > 0 ? true : false

        return (
            <div className="container">
                <div className='root'>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h3" className='title'>
                                Promotions
                            </Typography>
                            <div className='menuButton'>
                                <Button color="inherit" 
                                    onClick={() => this.setState({dataGenerateDialogOpen : true})}>
                                    Generate Data
                                </Button>
                            </div>
                        </Toolbar>
                        <Dialog open={this.state.dataGenerateDialogOpen} 
                                aria-labelledby="alert-dialog-title" 
                                aria-describedby="alert-dialog-description">
                            <DialogTitle id="alert-dialog-title">{"Approve action"}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    This operation will permanently delete all existing data 
                                    and will genereta new data.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button color="primary" 
                                    onClick={() => this.setState({dataGenerateDialogOpen: false})}>
                                    Cancel
                                </Button>
                                <Button onClick={() => this.generateNewData()} color="primary" autoFocus>
                                    Confirm
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </AppBar>
                </div>
                    { this.state.noData 
                        ? <div> <h2>No data records</h2> </div>
                        : 
                        <Fragment>
                            { loaded
                                ?   <Fragment>
                                    { this.state.backdropOpen 
                                        ? 
                                            <Fragment>
                                                <Backdrop open={this.state.backdropOpen}>
                                                    <div className='backdrop'>
                                                        <CircularProgress color="inherit" />
                                                        Generating data...
                                                    </div>
                                                </Backdrop>
                                                <Snackbar open={this.state.successSnackbarOpen} autoHideDuration={6000}>
                                                    <Alert severity="success">
                                                        Operation was successfull! Please wait...
                                                    </Alert>
                                                </Snackbar>
                                            </Fragment>
                                        : 
                                            <div className="body">
                                                <Promotions rows={this.state.rows} 
                                                    columns={this.state.columns} 
                                                    onStateChange={() => this.onStateChange()}
                                                    onDeleteSelected={(selectedIds) => this.onDeleteSelected(selectedIds)}/>
                                                <div className="count-row">
                                                <h4>Row count: {this.state.rows.length}</h4>
                                            </div> 
                                            </div>
                                    }
                                        </Fragment>
                                :   <Fragment>
                                        <div className="spinner">
                                            <Loader type="Bars" color="rgb(43, 43, 110)" height={100} width={100} />
                                        </div>
                                    </Fragment>   
                            }
                        </Fragment>
                    }
                    <Snackbar open={this.state.errorSnackbarOpen} autoHideDuration={6000}>
                        <Alert severity="error">
                            There was a problem with connecting to the server
                        </Alert>
                    </Snackbar>
            </div>
        )
    }
}
