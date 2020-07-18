import { createStyles, Theme } from '@material-ui/core/styles';

export const defaultProps = {
    headerHeight: 48,
    rowHeight: 48,
};

export const styles = (theme: Theme) =>
    createStyles({
    flexContainer: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    table: {
        '& .ReactVirtualized_Table_headerRow': {
        flip: false,
        paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
        },
    },
    tableRow: {
        cursor: 'pointer',
    },
    tableRowHover: {
        '&:hover': {
        backgroundColor: theme.palette.grey[200],
        },
    },
    tableCell: {
        flex: 1,
    },
    noClick: {
        cursor: 'initial',
    },
    }
);