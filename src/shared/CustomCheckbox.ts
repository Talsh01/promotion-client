import Checkbox from '@material-ui/core/Checkbox';
import { withStyles, Theme } from '@material-ui/core/styles';

const checkBoxStyles = (theme: Theme) => ({
    root: {
      '&$checked': {
        color: '#3D70B2',
      },
    },
    checked: {},
   })

export const CustomCheckbox = withStyles(checkBoxStyles)(Checkbox);