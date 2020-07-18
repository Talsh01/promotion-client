import { WithStyles } from '@material-ui/core/styles';
import { styles } from './constants';

export interface IState {
    rows: Array<any>;
    columns: Array<string>;
    rowCount?: number;
    columnsData: ColumnData[];
    headerHeight?: number;
    rowHeight?: number;
    onRowClick?: () => void;
    selectedIds: Map<string, boolean>;
}

export interface ColumnData {
    dataKey: string;
    label: string;
    numeric?: boolean;
    width: number;
}

export interface Row {
    index: number;
}

export interface PromotionsTableProps extends WithStyles<typeof styles> {
    rows: Array<any>;
    columns: Array<string>;
    rowCount: number;
    rowGetter: (row: Row) => any;
    onDeleteSuccess: (_id: string) => void;
    onDuplicationSuccess: (newRow: any) => void;
    onEditSuccess: (newRow: any) => void;
    onSelected: (selectedMap: Map<string, boolean>) => void;
}

export interface DisplayProps {
    rows: Array<any>;
    columns: Array<string>;
    onStateChange: () => void;
    onDeleteSelected: (selectedMap: Map<string, boolean>) => void;
}