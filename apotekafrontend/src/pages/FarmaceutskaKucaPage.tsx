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
    setFarmaceutskeKuce: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}
  
function EditToolbar(props: EditToolbarProps) {
    const { setFarmaceutskeKuce, setRowModesModel } = props;
  
    const handleClick = () => {
        const id = uuidv4();
        setFarmaceutskeKuce((oldRows : any) => [...oldRows, { 
            id: id, 
            naziv: '', 
            networth: '',
            adresa: '',
            datumOsnivanja: '', 
            isNew: true 
        }]);
        setRowModesModel((oldModel) => ({...oldModel, [id]: { mode: GridRowModes.Edit, fieldToFocus: 'naziv' } }));
    };
  
    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>Dodaj Novu Farmecutsku Kucu</Button>
        </GridToolbarContainer>
    );
}

const FarmaceutskaKucaPage = () => {
    const [reloadFarmaceutskeKuce, setReloadFarmaceutskeKuce] = useState(0);
    const [grupeLekova, setGrupeLekova] = useState<any>([]);
    const [lekovi, setLekovi] = useState<any>([]);
    const [farmaceutskekuce, setFarmaceutskeKuce] = useState<any>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [lek, setLek] = useState('');
    const [grupa, setGrupa] = useState('');

    const handleChangeLek = (event: SelectChangeEvent) => {
        setGrupa('');
        setLek(event.target.value as string);
    };

    const handleChangeGrupa = (event: SelectChangeEvent) => {
        setLek('');
        setGrupa(event.target.value as string);
    };

    useEffect(() => {
        fetchFarmaceutskeKuce();
    }, [reloadFarmaceutskeKuce]);

    useEffect(() => {
        fetchLekovi();
        fetchGrupeLekova();
    }, [])

   const fetchFarmaceutskeKuce = async () => {
        const response = await axiosInstance.get('/FarmaceutksaKuca');
        setFarmaceutskeKuce(response.data);
    };
 
    const fetchLekovi = async () => {
        const response = await axiosInstance.get('/Lek');
        setLekovi(response.data);
    };

    const fetchGrupeLekova = async () => {
        const response = await axiosInstance.get('/GrupaLekova');
        setGrupeLekova(response.data);
    };

    const handleFindGrupa = async () => {
        const response = await axiosInstance.get(`/FarmaceutksaKuca/grupa/${grupa}`);
        setFarmaceutskeKuce(response.data);
    }

    const handleFindLek = async () => {
        const response = await axiosInstance.get(`/FarmaceutksaKuca/lek/${lek}`);
        setFarmaceutskeKuce(response.data);
    }

    const handleDeleteClick = async (r: any) => {
        var response = await axiosInstance.delete(`/FarmaceutksaKuca/${r.naziv}`);
        if(response.status === 200) {
            NotificationManager.success('Farmaceutska kuca uspesno izbrisana.');
        }
        else {
            NotificationManager.error('Doslo je do greske prilikom brisanja farmaceutska kuce.')
        }
        setFarmaceutskeKuce(farmaceutskekuce.filter((row : any) => row.id !== r.id));
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
    
        const editedRow : any = farmaceutskekuce.find((row : any) => row.id === r.id);
            if (editedRow!.isNew) {
                setFarmaceutskeKuce(farmaceutskekuce.filter((row : any) => row.id !== r.id));
        }
    };
    
    const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
        const updatedRow = { ...newRow, isNew: false };
        var response;
        if(newRow.isNew) {
            var obj = {...newRow, id: randomIntFromInterval()};
            response = await axiosInstance.post(`/FarmaceutksaKuca`, obj); 
            if(response.status === 200) {
                NotificationManager.success('Farmaceutska kuca uspesno dodata.');
            }
            else {
                NotificationManager.error('Doslo je do greske prilikom dodavanja farmaceutske kuce.')
            }
        }
        else {
            response = await axiosInstance.put(`/FarmaceutksaKuca/${oldRow.naziv}`, newRow); 
            if(response.status === 200) {
                NotificationManager.success('Farmaceutska kuca uspesno izmenjena.');
            }
            else {
                NotificationManager.error('Doslo je do greske prilikom menjanja farmaceutske kuce.')
            }
        }
        setFarmaceutskeKuce(farmaceutskekuce.map((row : any) => (row.id === newRow.id ? updatedRow : row)));
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
            field: 'networth',
            headerName: 'Networth',
            flex: 1,
            editable: true,
        },
        {
            field: 'adresa',
            headerName: 'Adresa',
            flex: 1,
            editable: true,
        },
        {
            field: 'datumOsnivanja',
            headerName: 'Datum osnivanja',
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

    return(
        <div>
            <Grid container display={"flex"} justifyContent={"space-between"} mb={2}>
                <Grid item>
                    <Box sx={{ minWidth: 300 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Grupa</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={grupa}
                                label="Grupa"
                                onChange={handleChangeGrupa}
                            >
                                { 
                                    grupeLekova?.map((el: any, index: number) => {
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
                    <Button variant='outlined' onClick={() => { setGrupa(''); setReloadFarmaceutskeKuce(value => value + 1); }}>Osvezi tabeli na pocetno stanje</Button>
                    <Button sx={{ marginLeft: '10px !important' }} variant='contained' onClick={() => { handleFindGrupa(); }}>Pronadji grupu lekova</Button>
                </Grid>
            </Grid>
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
                    <Button variant='outlined' onClick={() => { setLek(''); setReloadFarmaceutskeKuce(value => value + 1); }}>Osvezi tabeli na pocetno stanje</Button>
                    <Button sx={{ marginLeft: '10px !important' }} variant='contained' onClick={() => { handleFindLek(); }}>Pronadji lek</Button>
                </Grid>
            </Grid>
            <Box sx={{ height: 800, width: '100%' }}>
                <DataGrid
                    rows={farmaceutskekuce}
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

export default FarmaceutskaKucaPage;
