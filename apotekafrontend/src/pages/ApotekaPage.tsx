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
    setApoteke: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}
  
function EditToolbar(props: EditToolbarProps) {
    const { setApoteke, setRowModesModel } = props;
  
    const handleClick = () => {
        const id = uuidv4();
        setApoteke((oldRows : any) => [...oldRows, { id: id, naziv: '', radnoVreme: '', brojZaposlenih: '', isNew: true }]);
        setRowModesModel((oldModel) => ({...oldModel, [id]: { mode: GridRowModes.Edit, fieldToFocus: 'naziv' } }));
    };
  
    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>Dodaj Novu Apoteku</Button>
        </GridToolbarContainer>
    );
}
  
const ApotekaPage = () => {
    const [reloadApoteke, setReloadApoteke] = useState(0);
    const [apoteke, setApoteke] = useState<any>([]);
    const [lekovi, setLekovi] = useState<any>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [lek, setLek] = useState('');

    const handleChangeLek = (event: SelectChangeEvent) => {
        setLek(event.target.value as string);
    };
  
    useEffect(() => {
        fetchApoteke();
    }, [reloadApoteke]);

    useEffect(() => {
        fetchLekove();
    }, [])

    const fetchApoteke = async () => {
        const response = await axiosInstance.get('/Apoteka');
        setApoteke(response?.data.map((el : any) => { return {...el, id: uuidv4() } }));
    };

    const fetchLekove = async () => {
        const response = await axiosInstance.get('/Lek');
        setLekovi(response?.data);
    };

    const handleFindLek = async () => {
        const response = await axiosInstance.get(`/Apoteka/grupa/${lek}`);
        setApoteke(response?.data.map((el : any) => { return {...el, id: uuidv4() } }));
    }

    const handleDeleteClick = async (r: any) => {
        var response = await axiosInstance.delete(`/Apoteka/${r.naziv}`);
        if(response.status === 200) {
            NotificationManager.success('Apoteka uspesno izbrisana.');
        }
        else {
            NotificationManager.error('Doslo je do greske prilikom brisanja apoteke.')
        }
        setApoteke(apoteke.filter((row : any) => row.id !== r.id));
    }

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };
    
    const handleEditClick = (row: any) => {
        setRowModesModel({ ...rowModesModel, [row.id]: { mode: GridRowModes.Edit } });
    };
    
    const handleSaveClick = (row: any) => {
        setRowModesModel({ ...rowModesModel, [row.id]: { mode: GridRowModes.View } });
    };
    
    const handleCancelClick = (r: any) => {
        setRowModesModel({
            ...rowModesModel,
            [r.id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    
        const editedRow : any = apoteke.find((row : any) => row.id === r.id);
            if (editedRow!.isNew) {
                setApoteke(apoteke.filter((row : any) => row.id !== r.id));
        }
    };
    
    const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
        const updatedRow = { ...newRow, isNew: false };
        var response;
        if(newRow.isNew) {
            var obj = {...newRow, id: randomIntFromInterval()}
            response = await axiosInstance.post(`/Apoteka`, obj); 
            if(response.status === 200) {
                NotificationManager.success('Apoteka uspesno dodata.');
            }
            else {
                NotificationManager.error('Doslo je do greske prilikom dodavanja apoteke.')
            }
        }
        else {
            response = await axiosInstance.put(`/Apoteka/${oldRow.naziv}`, newRow); 
            if(response.status === 200) {
                NotificationManager.success('Apoteka uspesno izmenjena.');
            }
            else {
                NotificationManager.error('Doslo je do greske prilikom menjanja apoteke.')
            }
        }
        setApoteke(apoteke.map((row : any) => (row.id === newRow.id ? updatedRow : row)));
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
            field: 'radnoVreme',
            headerName: 'Radno Vreme',
            flex: 1,
            editable: true,
        },
        {
            field: 'brojZaposlenih',
            headerName: 'Broj Zaposlenih',
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
                const isInEditMode = rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
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
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={() => handleEditClick(params.row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={() => handleDelete(params.row)}
                        color="inherit"
                    />,
                ];
            },
        }
    ];

    return (
        <div>
            <Grid container display={"flex"} justifyContent={"space-between"} mb={2}>
                <Grid item>
                    <Box sx={{ minWidth: 300 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Lek</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={lek}
                                label="Lek"
                                onChange={handleChangeLek}
                            >
                                { 
                                    lekovi?.map((el: any, index: number) => {
                                        return(
                                            <MenuItem value={el.name} key={index}>{el.name}</MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>   
                <Grid item>
                    <Button variant='outlined' onClick={() => { setLek(''); setReloadApoteke(value => value + 1); }}>Osvezi tabeli na pocetno stanje</Button>
                    <Button sx={{ marginLeft: '10px !important' }} variant='contained' onClick={() => { handleFindLek(); }}>Pronadji lek u apoteci</Button>
                </Grid>
            </Grid>
            <Box sx={{ height: 800, width: '100%' }}>
                <DataGrid
                    rows={apoteke}
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
                        toolbar: { setApoteke, setRowModesModel },
                    }}
                />
            </Box>
        </div>
    );
};

export default ApotekaPage;
