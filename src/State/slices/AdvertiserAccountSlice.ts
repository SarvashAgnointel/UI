import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdvAccState{
    createBreadCrumb:boolean,
    addWorkspaceFromDropdown: boolean,
    closeAddWorkspaceDialog: boolean,
    from_date: string,
    to_date: string,
    create_template_is_loading:boolean,
}

const initialState:AdvAccState={
    createBreadCrumb:false,
    addWorkspaceFromDropdown:false,
    closeAddWorkspaceDialog:false,
    from_date: '',
    to_date:'',
    create_template_is_loading:true,
}

const AdvertiserAccountSlice = createSlice({
    name: 'AdvertiserAccount',
    initialState:initialState,
    reducers:{
        setCreateBreadCrumb:(state,action: PayloadAction<boolean>)=>{

            state.createBreadCrumb=action.payload;
        },

        setAddWorkspaceFromDropdown:(state,action: PayloadAction<boolean>)=>{
            state.addWorkspaceFromDropdown=action.payload;
        },
        setCloseAddWorkspaceDialog:(state,action: PayloadAction<boolean>)=>{
            state.closeAddWorkspaceDialog=action.payload;
        },
        setFromDate:(state,action: PayloadAction<string>)=>{
            state.from_date=action.payload;
        },
        setToDate:(state,action: PayloadAction<string>)=>{
            state.to_date=action.payload;
        },
        setCreateTemplateLoading:(state,action: PayloadAction<boolean>)=>{
            state.create_template_is_loading=action.payload;
        },

        
    }
})

export const {setCreateBreadCrumb,setAddWorkspaceFromDropdown,setCloseAddWorkspaceDialog,setCreateTemplateLoading,} = AdvertiserAccountSlice.actions;

export default AdvertiserAccountSlice.reducer;