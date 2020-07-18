import React, { Fragment } from 'react';
import * as models from '../models/index';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import { AutoSizer, Column, Table, TableCellRenderer, TableHeaderProps } from 'react-virtualized';
import * as customUI from '../shared/index';
import EditMenu from './EditMenu';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant='filled' {...props} />;
}

class PromotionsTable extends React.PureComponent<models.PromotionsTableProps> {
  
    state: models.IState;

    constructor(props: any) {
        super(props);

        this.state = {
            rows: props.rows,
            columns: props.columns,
            columnsData: [],
            rowCount: props.rows.length,
            headerHeight: models.defaultProps.headerHeight,
            rowHeight: models.defaultProps.rowHeight,
            selectedIds: new Map()
        }

        // Create column data
        props.columns.forEach((x: any) => {
            let columnData: models.ColumnData = {
                dataKey: x,
                label: this.formatColumnName(x),
                width: 200
            }
            this.state.columnsData.push(columnData)
        });
    }

    private formatColumnName(name: string) {
        if (name !== '_id') {
            return name.replace(/([A-Z])/g, ' $1').trim();
        }
        return '';
    }

    private getRowClassName = ({ index }: models.Row) => {
            const { classes } = this.props;

            return clsx(classes.tableRow, classes.flexContainer, {
                [classes.tableRowHover]: index !== -1 && this.state.onRowClick != null,
            });
    };

    private handleSelectRow = (event: any, rowIndex: number) => {
        if (event.target.checked) {
            this.state.selectedIds.set(this.state.rows[rowIndex]._id, true);
        } else {
            this.state.selectedIds.delete(this.state.rows[rowIndex]._id);
        }

        this.props.onSelected(this.state.selectedIds);
    };

    private cellRenderer: TableCellRenderer = ({ cellData, columnIndex, rowIndex }) => {

        const { classes } = this.props;

        const isCheckboxColumn: boolean = columnIndex === 0 ? true : false;

        if (isCheckboxColumn) {
            return <customUI.CustomCheckbox indeterminate={false} 
                    checked={this.state.selectedIds.get(this.state.rows[rowIndex]._id)}
                    onChange={(event) => this.handleSelectRow(event, rowIndex)} 
                    />
        } else {
            return (
                <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, {
                [classes.noClick]: this.state.onRowClick == null,
                })}
                variant="body"
                style={{ height: this.state.rowHeight }}
                align={(columnIndex != null && this.state.columnsData && 
                this.state.columnsData[columnIndex].numeric) || false ? 'right' : 'left'}
                >
                {cellData}
                </TableCell>
            )
        }
    };

    private lastCellRenderer: TableCellRenderer = ({ rowIndex }) => {
        return (
            <EditMenu row={this.state.rows[rowIndex]} 
            key={this.state.rows[rowIndex]._id}
            onEditSuccess={(newRow) => this.props.onEditSuccess(newRow)}
            onDuplicateSuccess={(newRow) => this.props.onDuplicationSuccess(newRow)}
            onDeleteSuccess={(_id) => this.props.onDeleteSuccess(_id)} />
        );
    };

    private headerRenderer = ({ label, columnIndex }: TableHeaderProps & { columnIndex: number }) => {
        const { classes } = this.props;

        return (
            <TableCell component="div"
                className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
                variant="head" style={{ height: this.state.headerHeight }}
                align={(this.state.columnsData && 
                    this.state.columnsData[columnIndex].numeric) || false ? 'right' : 'left'}>
                <span>{label}</span>
            </TableCell>
        );
    };

    render() {
        const { classes, ...tableProps } = this.props;
        return (
            <AutoSizer>
                {({ height, width }) => (
                <Table
                    height={height}
                    width={width}
                    rowHeight={this.state.rowHeight!}
                    gridStyle={{
                    direction: 'inherit',
                    }}
                    headerHeight={this.state.headerHeight!}
                    className={classes.table}
                    {...tableProps}
                    rowClassName={(event) => this.getRowClassName(event)}  >
                    {this.state.columnsData && this.state.columnsData.map(({ dataKey, ...other }, index) => {
                        return (
                            <Column
                            key={dataKey}
                            headerRenderer={(headerProps) =>
                                this.headerRenderer({
                                ...headerProps,
                                columnIndex: index,
                                })
                            }
                            className={classes.flexContainer}
                            cellRenderer={this.cellRenderer}
                            dataKey={dataKey}
                            {...other}
                            />
                        );
                    })}
                    <Column label='' dataKey='edit' cellRenderer={this.lastCellRenderer} width={100} />
                </Table>
                )}
            </AutoSizer>
        );
    }
}

const PromotionsTableSelector = withStyles(models.styles)(PromotionsTable);

export default function PromotionDisplay(props: models.DisplayProps) {

    const [editSnackbarOpen, setEditSnackbarOpen] = React.useState(false);

    let selectedMap: Map<string, boolean> = new Map();

    const selected = (selectedIds:  Map<string, boolean>) => {
        selectedMap = selectedIds;
    }

    const editSuccess = () => {
        setEditSnackbarOpen(true);
        setTimeout(() => setEditSnackbarOpen(false), 5000);
    }

    return (
        <Fragment>
            <div className='delete-all'>
                <Tooltip title="Delete selected">
                    <IconButton aria-label="delete" onClick={() => props.onDeleteSelected(selectedMap)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <Paper style={{ height: 400, width: '100%' }}>
                <PromotionsTableSelector rows={props.rows} rowCount={props.rows.length}
                    onSelected={(selectedMap) => selected(selectedMap)}
                    rowGetter={({ index }) => props.rows[index]} columns={props.columns}
                    onEditSuccess={() => editSuccess()}
                    onDeleteSuccess={() => props.onStateChange()}
                    onDuplicationSuccess={() => props.onStateChange()}/>
            </Paper>

            <Snackbar open={editSnackbarOpen} autoHideDuration={6000}>
                <Alert severity="success">
                    Promotion was saved
                </Alert>
            </Snackbar>
        </Fragment>
    );
}