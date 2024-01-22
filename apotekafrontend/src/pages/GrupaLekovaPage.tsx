import { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';import {
    GridRowsProp,
    GridRowModesModel,
    GridRowModes,
    DataGrid,
    GridColDef,
    GridToolbarContainer,
    GridActionsCellItem,
    GridEventListener,
    GridRowModel,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { axiosInstance } from '../axios/axios';
import { NotificationManager } from 'react-notifications';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { randomIntFromInterval, uuidv4 } from '../helpers/_helpers';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Grid } from '@mui/material';

interface EditToolbarProps {
    setGrupeLekova: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}
  
function EditToolbar(props: EditToolbarProps) {
    const { setGrupeLekova, setRowModesModel } = props;
  
    const handleClick = () => {
        const id = uuidv4();
        setGrupeLekova((oldRows : any) => [...oldRows, { id: id, naziv: '', isNew: true }]);
        setRowModesModel((oldModel) => ({...oldModel, [id]: { mode: GridRowModes.Edit, fieldToFocus: 'naziv' } }));
    };
  
    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>Dodaj Novu Grupu Lekova</Button>
        </GridToolbarContainer>
    );
}
  
const GrupaLekovaPage = () => {
    const [reloadGrupeLekova, setReloadGrupeLekova] = useState(0);
    const [grupeLekova, setGrupeLekova] = useState<any>([]);
    const [farmaceutskeKuce, setFarmaceutske] = useState<any>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [fkuca, setFarmaceutskeKuce] = useState('');

    const handleChangeFkuca = (event: SelectChangeEvent) => {
        setFarmaceutskeKuce(event.target.value as string);
    };
  
    useEffect(() => {
        fetchGrupeLekova();
    }, [reloadGrupeLekova]);
    useEffect(() => {
        fetchFarmaceutskeKuce();
    }, [])

    const fetchGrupeLekova = async () => {
        const response = await axiosInstance.get('/GrupaLekova');
        setGrupeLekova(response.data?.map((el : any) => { return {...el, id: uuidv4() } }));
    };

    const handleDeleteClick = async (r: any) => {
        var response = await axiosInstance.delete(`/GrupaLekova/${r.naziv}`);
        if(response.status === 200) {
            NotificationManager.success('Grupa lekova uspesno izbrisana.');
        }
        else {
            NotificationManager.error('Doslo je do greske prilikom brisanja grupe lekova.')
        }
        setGrupeLekova(grupeLekova.filter((row : any) => row.id !== r.id));
    }
    const handleEditClick = (row: any) => {
        setRowModesModel({ ...rowModesModel, [row.id]: { mode: GridRowModes.Edit } });
    };
    const handleFindFkuca = async () => {
        const response = await axiosInstance.get(`/GrupaLekova/fkucu/${fkuca}`);
        setGrupeLekova(response.data);
    }

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };
    
    const handleSaveClick = (row: any) => {
        setRowModesModel({ ...rowModesModel, [row.id]: { mode: GridRowModes.View } });
    };
    const fetchFarmaceutskeKuce = async () => {
        const response = await axiosInstance.get('/FarmaceutksaKuca');
        setFarmaceutske(response.data);
    };
    const handleCancelClick = (r: any) => {
        setRowModesModel({
            ...rowModesModel,
            [r.id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    
        const editedRow : any = grupeLekova.find((row : any) => row.id === r.id);
            if (editedRow!.isNew) {
                setGrupeLekova(grupeLekova.filter((row : any) => row.id !== r.id));
        }
    };
    
    const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
        const updatedRow = { ...newRow, isNew: false };
        var response;
        if(newRow.isNew) {
            var obj = {...newRow, id: randomIntFromInterval()};
            response = await axiosInstance.post(`/GrupaLekova`, obj); 
            if(response.status === 200) {
                NotificationManager.success('Grupa lekova uspesno dodata.');
            }
            else {
                NotificationManager.error('Doslo je do greske prilikom dodavanja grupe lekova.')
            }
            setGrupeLekova(grupeLekova.map((row : any) => (row.id === newRow.id ? updatedRow : row)));
        }
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns = (handleDelete: Function) : GridColDef[] => [
        {
            field: 'naziv',
            headerName: 'Naziv',
            flex: 1,
            editable: true,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: (params) => {
                const isInEditMode = rowModesModel[params.row?.id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                        return [
                            <GridActionsCellItem
                                icon={<SaveIcon />}
                                label="Save"
                                sx={{
                                color: 'primary.main',
                                }}
                                onClick={() => handleSaveClick(params.row)}
                            />,
                            <GridActionsCellItem
                                icon={<CancelIcon />}
                                label="Cancel"
                                className="textPrimary"
                                onClick={() => handleCancelClick(params.row)}
                                color="inherit"
                            />,
                        ];
                }
        
                return [
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={() => handleDelete(params.row)}
                        color="inherit"
                    />,<GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    className="textPrimary"
                    onClick={() => handleEditClick(params.row)}
                    color="inherit"
                />,
                ];
            },
        }
    ];

    return(
        <div>
            <Grid container display={"flex"} justifyContent={"space-between"} mb={2}>
                <Grid item>
                    <Box sx={{ minWidth: 300 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Farmaceutska kuca</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={fkuca}
                                label="Farmaceutska kuca"
                                onChange={handleChangeFkuca}
                            >
                                { 
                                    farmaceutskeKuce?.map((el: any, index: number) => {
                                        return(
                                            <MenuItem value={el.naziv} key={index}>{el.naziv}</MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>   
                <Grid item>
                    <Button variant='outlined' onClick={() => { setFarmaceutskeKuce(''); setReloadGrupeLekova(value => value + 1); }}>Osvezi tabeli na pocetno stanje</Button>
                    <Button sx={{ marginLeft: '10px !important' }} variant='contained' onClick={() => { handleFindFkuca(); }}>Pronadji grupu lekova</Button>
                </Grid>
            </Grid>
            <Box sx={{ height: 800, width: '100%' }}>
                <DataGrid
                    rows={grupeLekova}
                    columns={columns(handleDeleteClick)}
                    initialState={{
                        pagination: {
                                paginationModel: {
                                pageSize: 25,
                            },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={handleRowModesModelChange}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={(newRow, oldRow) => processRowUpdate(newRow, oldRow)}
                    slots={{
                        toolbar: EditToolbar,
                    }}
                    slotProps={{
                        toolbar: { setFarmaceutskeKuce, setRowModesModel },
                    }}
                />
            </Box>
        </div>
    )
}

export default GrupaLekovaPage;
