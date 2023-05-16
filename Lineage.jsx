/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-constant-condition */
/* eslint-disable react/prop-types */
/* eslint-disable no-prototype-builtins */
/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */
import { useState, memo, useEffect, Fragment, useRef, forwardRef, useImperativeHandle } from 'react';
import { Droppable } from 'react-drag-and-drop'
import LineageDag from '../../components/lineage/index';
import { SET_LINEAGE_TABLES, SET_WORKSPACE_INFO, SET_RELATION_DATA, SET_TABLE_DATA } from '../../redux/actions/types';
import { BorderOuterOutlined, DownSquareOutlined, CloseCircleOutlined, StarOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import secureAxios from '../../secureAxios';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import moment from 'moment';
import {useParams} from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import {Tooltip} from 'antd';
import OutsideClickHandler from 'react-outside-click-handler';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import {grey} from '@mui/material/colors';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LinkModal from './link_modal';
import KeyboardDoubleArrowRightOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowRightOutlined';
import ActionMenu, {action} from '../../components/lineage/component/action-menu';

import './index.css';




const Lineage = forwardRef((props, ref) => {
  
  const dispatch = useDispatch();

  const application = useSelector(state => ({
    ...state.application
  }));

  const [height, setHeight] = useState(0);
  const [open, setOpen] = useState(false);
  const [is_drawer_open, setis_drawer_open] = useState(false);
  const [is_modal_loading, setis_modal_loading] = useState(false);
  const {workspace_id, lineage_id} = useParams();
  const containerRef = useRef();
  const [_tables, setTables] = useState([]);
  const [_relations, setRelations] = useState([]);
  const [is_loaded, setLoaded] = useState(false);
  const [isWorking, setWorking] = useState(false);
  const [canvas, setCanvas] = useState();
  const [_refresh, setRefresh] = useState(false);
  const [msg, setMessage] = useState('');
  const [modal_info, setModalInfo] = useState({});
  const [version_list, setVersionList] = useState([]);
  const [version_drawer, setversion_drawer] = useState(false);
  const [centerId, setcenterId] = useState(0);
  const [boxId, setBoxId] = useState(0);
  const [_data, setData] = useState(props.objectNodes);
  const [role_details, setRoleDetails] = useState({left: 0, top: 0, name: '', permissions: []});
  const [node_details, setNodeDetails] = useState({left: 0, top: 0, detail: {}});  
  const [all_roles, setAllRoles] = useState([]);
  const _roles = useRef();
  const _all_users = useRef();
  const _all_tables = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const anchorRef = useRef(null);
  const [propertyData, setPropertyData] = useState([]);
  const [dialogData, setDialogData] = useState({});
  const [checked, setChecked] = useState({});
  const [roleData, setRoleData] = useState({});
  const [confirm_delete, setConfirmDelete] = useState(''); 
  const _roleData = useRef();
  const permissions = useRef();
  const _tmp = useRef();
  const isClicked = useRef();
  const relations_ref = useRef();
  const nodeRef = useRef();
  const delete_options = useRef();



  // dialog
  const [fullWidth, setFullWidth] = useState(true);
  const [maxWidth, setMaxWidth] = useState('sm');
  const [msg2, setMessage2] = useState('');
  // dialog confirm
  const [deletedialogConfirmOpen, setDeleteDialogConfirmOpen] = useState(false);
  
  const handleCloseDialogConfirm = () => {
    setMessage2(null);
    delete_options.current = {}
    deletedialogConfirmOpen(false);
  };
  

  const columns = [
    {
      key: 'id',
      primaryKey: true
    }, {
      key: 'title',
    }];
  
  const operator = [];
  
  const handleOpenLineMenu = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseLineMenu = (event) => {
    event.stopPropagation()
    const all_class_names = event.target.className;
    if (anchorRef.current && !all_class_names.includes('MuiBackdrop-root')) {
      return;
    }
    setAnchorEl(null);
  };

  const handleCloseNodeMenu = (event) => {    
    setAnchorEl2(null);
  };

  useEffect(()=>{
    let _data = props?.objectNodes;
    for (const item_id in _data) {
      const children = _data[item_id]['rel']['child'];
      for (const child_id of children) {
        _data[child_id]['parent_id'] = item_id;
      }
    }
    setData(_data);
  }, [props.objectNodes]);  

  useEffect(()=>{
    _roles.current = application?.lineage_data?.roleNodes;
    setAllRoles(application?.lineage_data?.roleNodes);
  }, [application?.lineage_data?.roleNodes]);  

  useEffect(()=>{
    _all_users.current = application?.lineage_data?.userNodes;
  }, [application?.lineage_data?.userNodes]); 

  useEffect(()=>{
    _all_tables.current = application?.lineage_data?.objectNodes;
  }, [application?.lineage_data?.objectNodes]); 
  

  useEffect(()=>{
    relations_ref.current = _relations;
    dispatch({
      type: SET_RELATION_DATA,
      payload: {
        relations_data: _relations
      }
    });
  }, [_relations]); 

  useEffect(()=>{
    dispatch({
      type: SET_TABLE_DATA,
      payload: {
        tables_data: _tables
      }
    });
  }, [_tables, dispatch]); 

  useEffect(()=>{
    permissions.current = Object.values(application?.lineage_data?.permissionNodes);
  }, [application?.lineage_data.permissionNodes]);

  useEffect(() => {
    if (Object.keys(checked).length > 0){
      const options = _tmp.current?.options;
      const _relation_index = _.findIndex(application?.relations_data, {srcTableId: options?.sourceNode, tgtTableId: options?.targetNode, srcTableColName: options?.srcTableColName, tgtTableColName:options?.tgtTableColName})
      if(_relation_index != -1 && isClicked.current){
        let relation_d = application?.relations_data;
        let new_rleation = relation_d[_relation_index];
        new_rleation.permissions = checked;
        relation_d.splice(_relation_index, 1, new_rleation);
        dispatch({
          type: SET_RELATION_DATA,
          payload: {
            relations_data: relation_d
          }
        });
        window.localStorage.setItem('relations',  JSON.stringify(relation_d));
      }
    }
    
  }, [checked]);

  
  const toggleDrawer = (open) => (event) => {
    setversion_drawer(open)
  };

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleOpenNodeProperty = (options) => {
    console.log(options)
    setModalInfo(options);
    setis_drawer_open(true);
    setis_modal_loading(true);
    // const boxID = window.localStorage.getItem('box_id') || 0;
    // if (!_.isEqual(boxID, e.detail.id)){
    //   setModalInfo(e.detail);
    //   setis_drawer_open(true);
    //   setis_modal_loading(true);
    //   setcenterId(e.detail.id)
    // }
  }


  const removeFieldFromTables = (options, main_source_node) => {
    const tables = _tables;
    const table_index = _.findIndex(tables, {id: options?.targetNode});
    if (main_source_node == options?.targetNode){
      return false;
    }

    if (table_index == -1){
      return false;
    }
    let old_table = tables[table_index];
    let fileds = old_table?.fields || [];
    // by default
    const field_index = _.findIndex(fileds, {id: options?.srcTableColName});
    if (field_index != -1){
      fileds.splice(field_index, 1);
    }          
    
    let new_table = old_table;
    tables.splice(table_index, 1, new_table);
    if (tables[table_index].fields.length < 1){
      tables.splice(table_index, 1);
    }
    setTables([]);    
    window.localStorage.setItem('tables', JSON.stringify(tables));
    setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));
  }

  const handleCheck = (event, id, options) => {
    isClicked.current = true;
    _tmp.current = {options: options}
    setChecked(prevObjects => ({...prevObjects, [id]:event.target.checked}));
  }

  const remove_line = (options) =>{
    const main_source_node = options?.sourceNode;
    while (true){
      console.log({srcTableId: options?.sourceNode, tgtTableId: options?.targetNode, srcTableColName: options?.srcTableColName, tgtTableColName:options?.tgtTableColName})
      const _relation_index = _.findIndex(application?.relations_data, {srcTableId: options?.sourceNode, tgtTableId: options?.targetNode, srcTableColName: options?.srcTableColName, tgtTableColName:options?.tgtTableColName})
      if(_relation_index != -1){
        let relation_d = application?.relations_data;
        relation_d.splice(_relation_index, 1)
        dispatch({
          type: SET_RELATION_DATA,
          payload: {
            relations_data: relation_d
          }
        });
        
        removeFieldFromTables(options, main_source_node);          
        
        const child_relation_index = _.findIndex(application?.relations_data, {srcTableId: options?.targetNode, srcTableColName: options?.srcTableColName, tgtTableColName:options?.tgtTableColName});
        if (child_relation_index == -1){
          break
        }
        options.sourceNode = options?.targetNode;
        options.targetNode = relation_d[child_relation_index]?.tgtTableId;
        removeFieldFromTables(options, main_source_node);

        setRelations([]);        
        window.localStorage.setItem('relations', JSON.stringify(relation_d));
        setRelations(relation_d);
      }
      else{
        break
      }
    }
    setOpen(true);
    setMessage('Connection Removed');
    setAnchorEl(null);
  }

  const handleExecuteDelete = () => {
    if (confirm_delete === 'delete me'){
      setMessage2(null);
      remove_line(delete_options.current);
      setDeleteDialogConfirmOpen(false);
    }
    else{
      setMessage2('Please type delete me')
    }
  }

  const handleRemoveLine = (options) => {
    delete_options.current = options;
    setMessage2(null);
    setDeleteDialogConfirmOpen(true)
  }
  
  
  const load_versions = () => {
    secureAxios.get(`${process.env.REACT_APP_SERVICE_PYTHON_API_URL}/lineage/history/${workspace_id}/${lineage_id}`).then((response) => {
      setis_modal_loading(false);
      setVersionList(response.data)
    }).catch((error) => {
      setis_modal_loading(false);
    })
  }

  const set_lineage = (lineage_data, version, created_date) => {
    setTables([]);
    setRelations([]);
    setOpen(false); 
    const relations = JSON.parse(lineage_data).relations;
    const tables = JSON.parse(lineage_data).tables;
    const roles = JSON.parse(lineage_data).roles;
    window.localStorage.setItem('tables',  JSON.stringify(tables));
    window.localStorage.setItem('relations',  JSON.stringify(relations));
    setTables(tables);
    setRelations(relations);
    setLoaded(true);
    dispatch({
      type: SET_LINEAGE_TABLES,
      payload:{
        version: version,
        created_date: created_date
      }
    });
  }

  useEffect(() => {
    window.localStorage.removeItem('tables');
    window.localStorage.removeItem('relations');
    setOpen(true);
    setMessage('Loading Lineage...');

    secureAxios.get(`${process.env.REACT_APP_SERVICE_PYTHON_API_URL}/workspace/${workspace_id}`).then((response) => {
      dispatch({
        type: SET_WORKSPACE_INFO,
        payload:{
          workspace_info: response.data
        }
      });
    })

    const formatTitle = (str) => {
      return str.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
    }


    secureAxios.get(`${process.env.REACT_APP_SERVICE_PYTHON_API_URL}/lineage/${workspace_id}/${lineage_id}`).then((response) => {
      set_lineage(response.data.lineage_data, response.data.version, response.data.created_timestamp)
    }).catch((error) => {
      setOpen(false);
      setTables([]);
      setRelations([]);
      setLoaded(true);
      window.localStorage.setItem('roles', JSON.stringify(Object.values(props?.roleNodes)));
    })

    window.addEventListener('show_tooltip', (e) => {   
      setChecked({});
      setDialogData({});
      isClicked.current = false;   
      const _offset = document.getElementsByClassName('butterfly-lineage-dag')[0].getBoundingClientRect()
      const e_data = document.getElementById(e.detail.id).getBoundingClientRect();
      let name;
      let obj_type;
      let _type;
      let _propertyData = [];
      let all_users = _all_users.current;
      const _id = e.detail.options?.id;
      if (_roleData.current == undefined){
        _roleData.current = {};
      }
      
      if (!_roleData?.current.hasOwnProperty(_id)){
        let tables = _.cloneDeep(_tables);
        if (JSON.parse(window.localStorage.getItem('tables'))){
          tables = _.cloneDeep(JSON.parse(window.localStorage.getItem('tables')));
        }

        if (e.detail.options.role_type === 'user'){
          const index = _.findIndex(tables, {id: e.detail.options?.sourceNode});
          const fileds = tables[index].fields;
          const field_index = _.findIndex(fileds, {id: e.detail.options?.srcTableColName});
          const target_index = _.findIndex(tables, {id: e.detail.options?.targetNode});
          
          if (field_index != -1){
            const user_descrition = all_users[fileds[field_index]?.id]?.description || '';
            const role_descrition = _roles.current[e.detail.options?.targetNode]?.description || '';
            console.log(all_users);
            console.log(fileds[field_index]?.id)
            console.log(_roles);
            console.log(e.detail.options?.targetNode)


            name = fileds[field_index].title;
            _propertyData.push({'type': 'User', 'value': name, description: user_descrition});
            _propertyData.push({'type': 'Role', 'value': tables[target_index]?.name, description: role_descrition});
            obj_type = 'user';
            _type = 'User'
          }
        }
        else{
          let roles = _roles.current;
          const target_index = _.findIndex(tables, {id: e.detail.options?.targetNode});
          if (roles[e.detail.options._property?.id] != undefined){
            name = roles[e.detail.options._property?.id].text;
            const object_descrition = _all_tables[e.detail.options?.targetNode]?.description || '';
            const role_descrition = roles[e.detail.options._property?.id].description | "";
            _propertyData.push({'type': 'Role', 'value': name, description: role_descrition, obj_type: 'Role'})
            _propertyData.push({'type': 'Object', 'value': `${tables[target_index]?.name} (${formatTitle(tables[target_index]?.object_type)})`, obj_type: formatTitle(tables[target_index]?.object_type), description: object_descrition});
            obj_type = tables[target_index]?.object_type;
            _type = 'Role'
          }          
        }
        const roledata = {propertyData: _propertyData, name: name, obj_type: obj_type, type: _type};
        setDialogData(roledata)
        setPropertyData(_propertyData);
        let d = {..._roleData.current, [_id]: roledata};
        _roleData.current=d;
      }
      else{
        setPropertyData(_roleData.current[_id].propertyData);
        setDialogData(_roleData.current[_id]);
        name = _roleData.current[_id]?.name;
        obj_type = _roleData.current[_id]?.obj_type;
      }
      const _relation_index = _.findIndex(relations_ref.current, {
        srcTableId: e.detail.options?.sourceNode, 
        tgtTableId: e.detail.options?.targetNode, 
        srcTableColName: e.detail.options?.srcTableColName, 
        tgtTableColName:e.detail.options?.tgtTableColName
      });     

      setRoleDetails({left: e.detail.clientX - _offset.x, top: e.detail.clientY - _offset.y, name: name, permissions: permissions.current, options: e.detail.options});

      if (_relation_index != -1){
        console.log(relations_ref.current[_relation_index])
        setChecked(relations_ref.current[_relation_index]?.permissions || {});
      }
    })

    window.addEventListener('change_data', () => {      
      const _recived_data = JSON.parse(window.localStorage.getItem('table_data'));
      if (!_recived_data){
        return
      }
      let table_data = JSON.parse(window.localStorage.getItem('tables'));
      if (!table_data){
        window.localStorage.setItem('table_data', _tables);
        table_data = JSON.parse(window.localStorage.getItem('tables'));
      }
      const index = _.findIndex(table_data, {id: _recived_data?.node_id});
      let changed_data = table_data[index];
      _.extend(changed_data, {_left: _recived_data?.left, _top: _recived_data?.top, left: _recived_data?.left, top: _recived_data?.top})
      table_data.splice(index, 1, changed_data);
      window.localStorage.setItem('tables', JSON.stringify(table_data));
    })

    window.addEventListener('relation_data', () => {      
      const _recived_data = JSON.parse(window.localStorage.getItem('relation_data'));
      if (!_recived_data){
        return
      }

      // console.log(_recived_data)
      
      let tables = _.cloneDeep(_tables);
      if (JSON.parse(window.localStorage.getItem('tables'))){
        tables = _.cloneDeep(JSON.parse(window.localStorage.getItem('tables')));
      }
      const source_index = _.findIndex(tables, {id: _recived_data?.source});
      const target_index = _.findIndex(tables, {id: _recived_data?.target});

      if (tables[source_index].node_type == 'object' || tables[source_index].node_type == 'role'){
        if(tables[source_index].fields.length <= 0){
          const type_of = tables[source_index].node_type == 'role' ? 'user' : 'role';
          setMessage(`Invalid relationship. ${tables[source_index].name} does not have any ${type_of} attached.`);
          setOpen(true);          
          setTables([]);
          setRelations([]);
          window.localStorage.setItem('tables', JSON.stringify(tables));
          setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));
          
          let relation = _.cloneDeep(_relations);
          if (JSON.parse(window.localStorage.getItem('relations'))){
            relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
          }
          window.localStorage.setItem('relations', JSON.stringify(relation));
          setRelations(relation) 
          return false
        }
      }

      if (tables[target_index]?.allowed_lists != '*'){
        if (tables[target_index].hasOwnProperty('allowed_lists')){
          if (tables[target_index]?.allowed_lists.includes(_recived_data?.source) == 0){
            if (tables[source_index].node_type == 'user' &&  tables[target_index].node_type != 'role'){
              setMessage(`Invalid relationship1. The User cannot be linked to ${tables[target_index].name} ${tables[target_index].object_type}.`);
              setOpen(true);          
              setTables([]);
              setRelations([]);
              window.localStorage.setItem('tables', JSON.stringify(tables));
              setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));
              
              let relation = _.cloneDeep(_relations);
              if (JSON.parse(window.localStorage.getItem('relations'))){
                relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
              }
              window.localStorage.setItem('relations', JSON.stringify(relation));
              setRelations(relation) 
              return false
            }
            else if (tables[source_index].node_type != 'user'){

              let parent_ids = [];
              let last_id = _recived_data?.target;
              let fields = [];

              // when role is try to connect to all objects (Ex: db, schema, table, views)
              if (tables[source_index].node_type == 'role' && ['object'].includes(tables[target_index].node_type)){
                while(true){
                  if (_data[last_id]){
                    // console.log('me')
                    if (_data[last_id].parent_id != '0'){
                      parent_ids.push(_data[last_id].parent_id);
                      last_id = _data[last_id].parent_id;
                      continue
                    }
                    break                    
                  }
                  break              
                }
                // console.log(parent_ids)
                if (parent_ids.length != 0){
                  fields.push({
                    id: _recived_data?.source,
                    title: tables[source_index].name,
                  });
                  // console.log(_recived_data)
                }
              }

              else{
                last_id = _recived_data?.target;
                if (_data[last_id].parent_id == _data[_recived_data?.source].parent_id){
                  setMessage(`Invalid relationship2. The ${tables[source_index].name} ${tables[source_index].object_type} cannot be linked to ${tables[target_index].name} ${tables[target_index].object_type}.`);
                  setOpen(true);          
                  setTables([]);
                  setRelations([]);
                  window.localStorage.setItem('tables', JSON.stringify(tables));
                  setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));

                  let relation = _.cloneDeep(_relations);
                  if (JSON.parse(window.localStorage.getItem('relations'))){
                    relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
                  }
                  window.localStorage.setItem('relations', JSON.stringify(relation));
                  setRelations(relation);
                  return false
                }
                else{
                  if (_data[_data[last_id].parent_id].parent_id == _data[_data[_recived_data?.source].parent_id].parent_id){
                    setMessage(`Invalid relationship3. The ${tables[source_index].name} ${tables[source_index].object_type} cannot be linked to ${tables[target_index].name} ${tables[target_index].object_type}.`);
                    setOpen(true);          
                    setTables([]);
                    setRelations([]);
                    window.localStorage.setItem('tables', JSON.stringify(tables));
                    setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));

                    let relation = _.cloneDeep(_relations);
                    if (JSON.parse(window.localStorage.getItem('relations'))){
                      relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
                    }
                    window.localStorage.setItem('relations', JSON.stringify(relation));
                    setRelations(relation) 
                    return false
                  }


                  if (_data[_recived_data?.source].object_type !== 'schema'){
                    while(true){
                      if (_data[last_id]){
                        if (_data[last_id].parent_id != _recived_data?.source && _data[last_id].parent_id != 0){
                          parent_ids.push(_data[last_id].parent_id)
                          last_id = _data[last_id].parent_id
                        }
                        else{               
                          break
                        }                
                      }
                      else{
                        break
                      }              
                    }
                  }
                  else{
                    // console.log(tables[target_index]?.allowed_lists)
                    setMessage(`Invalid relationship4. The ${tables[source_index].name} ${tables[source_index].object_type} cannot be linked to ${tables[target_index].name} ${tables[target_index].object_type}.`);
                    setOpen(true);          
                    setTables([]);
                    setRelations([]);
                    window.localStorage.setItem('tables', JSON.stringify(tables));
                    setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));

                    let relation = _.cloneDeep(_relations);
                    if (JSON.parse(window.localStorage.getItem('relations'))){
                      relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
                    }
                    window.localStorage.setItem('relations', JSON.stringify(relation));
                    setRelations(relation);
                    return false
                  }
                }
              }

              if(tables[source_index].node_type == 'role'){
                parent_ids = [_recived_data?.target, ...parent_ids];
                // console.log(parent_ids)
              }
                           
              
              parent_ids.map((id) => {
                let index = _.findIndex(tables, {id: id});
                if (index == -1){
                  let allowed_lists = [];
                  allowed_lists.push(_data[id]?.parent_id);
                  let node1 = {
                    id: id,
                    name: props?.objectNodes[id]?.text,
                    fields: fields,
                    node_type: 'object',
                    is_collpase: false,
                    allowed_lists: allowed_lists,
                    parent_id: _data[id]?.parent_id,
                    object_type: props?.objectNodes[id]?.object_type
                  };
                  tables.push(node1);
                  window.localStorage.setItem('tables', JSON.stringify(tables));
                }
                else{
                  let old_table = tables[index];
                  if (_.findIndex(old_table.fields, {id: _recived_data?.source}) == -1){
                    old_table.fields.push({
                      id: _recived_data?.source,
                      title: _recived_data?.source,
                    });
                  }                 
                  let new_table = old_table
                  tables.splice(index, 1, new_table);
                  window.localStorage.setItem('tables', JSON.stringify(tables));
                }
              })

              let relation = _.cloneDeep(_relations);
              if (JSON.parse(window.localStorage.getItem('relations'))){
                relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
              }              

              parent_ids.map((id, index) => {
                let new_relation;
                if (_.findIndex(tables, {id: id})  != -1){
                  if (_data[id] == undefined){
                    return false
                  }
                  if (_data[id].parent_id == id){
                    return false
                  }
                  if(_.findIndex(relation, {tgtTableId: id, srcTableId: _data[id].parent_id, srcTableColName: _recived_data?.source, tgtTableColName: _recived_data?.source}) == -1){
                    console.log(_data[id].parent_id)
                    new_relation = {
                      srcTableId:  _data[id].parent_id,
                      tgtTableId:  id,
                      srcTableColName: _recived_data?.source,
                      tgtTableColName: _recived_data?.source,
                      role_type: 'object',
                      connect_type: 'role'
                    };             
                    relation.push(new_relation);
                    window.localStorage.setItem('relations', JSON.stringify(relation)); 
                  }
                  
                }

                // for last connect
                if (index === (parent_ids.length - 1)){
                  // if its object
                  if (tables[source_index].node_type != 'role'){
                    new_relation = {
                      srcTableId:  _data[_recived_data?.target].parent_id,
                      tgtTableId:  _recived_data?.target,
                      srcTableColName: _data[_recived_data?.target].parent_id,
                      tgtTableColName: _recived_data?.target,
                      role_type: 'object',
                      connect_type: 'role'
                    };                    
                  }
                  // if its role
                  else{
                    new_relation = {
                      srcTableId:  _recived_data?.source,
                      tgtTableId:  last_id,
                      srcTableColName: _recived_data?.source,
                      tgtTableColName: _recived_data?.source,
                      role_type: 'role',
                      connect_type: 'role'
                    };                   
                  }
                  if(_.findIndex(relation, {tgtTableId: last_id, srcTableId:  _recived_data?.source, srcTableColName: _recived_data?.source, tgtTableColName: _recived_data?.source}) == -1){              
                    relation.push(new_relation);
                    window.localStorage.setItem('relations', JSON.stringify(relation));   
                  }
                }
                
              })

              if (parent_ids){
                setTables([]);
                setRelations([]);
                setRefresh(true);

                setTimeout(()=> {
                  setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));
                  setRelations(_.cloneDeep(JSON.parse(window.localStorage.getItem('relations'))));
                  // console.log(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))))
                  // console.log(_.cloneDeep(JSON.parse(window.localStorage.getItem('relations'))))
                }, 0);


                
              }
            
              // if (tables[tables[target_index].parent_id].parent_id == source_index){
              //   console.log("chain found")
              // }
              if (!parent_ids){
                setMessage(`Invalid relationship5. The ${tables[source_index].name} ${tables[source_index].object_type} cannot be linked to ${tables[target_index].name} ${tables[target_index].object_type}.`);
                setOpen(true);  
              }
                      
              setTables([]);
              setRelations([]);
              window.localStorage.setItem('tables', JSON.stringify(tables));
              setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));

              if (JSON.parse(window.localStorage.getItem('relations'))){
                relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
              }
              window.localStorage.setItem('relations', JSON.stringify(relation));
              setRelations(relation);
              return false
            }
          }
        }
        else{
          setMessage(`Invalid relationship6. The ${tables[source_index].name} ${tables[source_index].object_type} cannot be linked to ${tables[target_index].name} ${tables[target_index].object_type}.`);
          setOpen(true);          
          setTables([]);
          setRelations([]);
          window.localStorage.setItem('tables', JSON.stringify(tables));
          setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));

          if (JSON.parse(window.localStorage.getItem('relations'))){
            relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
          }
          window.localStorage.setItem('relations', JSON.stringify(relation));
          setRelations(relation);
          return false;

        }     
      }
      
            
      if (`${_recived_data?.source}-right` == _recived_data?.sourceEndpoint && `${_recived_data?.target}-left` == _recived_data?.targetEndpoint){
      
        if (_.findIndex(tables[source_index].fields, {id: tables[source_index].name}) == -1){
          let new_table = tables[source_index]
          let old_data = new_table.fields
          old_data.push({id: tables[source_index].name, title: tables[source_index].name})
          new_table.fields = old_data
          tables.splice(source_index, 1, new_table);       
        }

        if (_.findIndex(tables[target_index].fields, {id: tables[source_index].name}) == -1){
        
          let new_table = tables[target_index]
          let old_data = new_table.fields
          old_data.push({id: tables[source_index].name, title: tables[source_index].name})
          new_table.fields = old_data
          tables.splice(target_index, 1, new_table);
          
        }

      }

      else{
        if (_.findIndex(tables[source_index].fields, {id: _recived_data?.sourceEndpoint.replace('-right', '').replace('-left', '')}) == -1){
          let new_table = tables[source_index]
          let old_data = new_table.fields
          old_data.push({id: _recived_data?.sourceEndpoint.replace('-right', '').replace('-left', ''), title: _recived_data?.sourceEndpoint.replace('-right', '').replace('-left', '')})
          new_table.fields = old_data
          tables.splice(source_index, 1, new_table);       
        }
        if (_.findIndex(tables[target_index]?.fields, {id: _recived_data?.sourceEndpoint.replace('-right', '').replace('-left', '')}) == -1){
        
          let new_table = tables[target_index]
          let old_data = new_table.fields
          old_data.push({id: _recived_data?.sourceEndpoint.replace('-right', '').replace('-left', ''), title: _recived_data?.sourceEndpoint.replace('-right', '').replace('-left', '')})
          new_table.fields = old_data
          tables.splice(target_index, 1, new_table);
          
        }       
        
        
      }

      window.localStorage.setItem('tables', JSON.stringify(tables));

      let relation = _.cloneDeep(_relations);
      if (JSON.parse(window.localStorage.getItem('relations'))){
        relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
      }
      
      let new_relation;
      if (tables[source_index]['node_type'] == 'role'){
        new_relation = {
          srcTableId:  _recived_data?.source.toString(),
          tgtTableId:  _recived_data?.target.toString(),
          connect_type: 'role'
        }
      }
      else{
        if (`${_recived_data?.source}-right` == _recived_data?.sourceEndpoint && `${_recived_data?.target}-left` == _recived_data?.targetEndpoint){
          new_relation = {
            srcTableId:  _recived_data?.source.toString(),
            tgtTableId:  _recived_data?.target.toString(),
            srcTableColName: tables[source_index].name,
            tgtTableColName: tables[source_index].name,
            role_type: tables[source_index].node_type,
            connect_type: 'role'
          }
        }
        else{
          if (_.findIndex(relation, {tgtTableId: tables[source_index].name}) == -1){
            if (_.findIndex(tables[target_index].fields, {id: tables[source_index].name}) != -1){ // if not match target column
              new_relation = {
                srcTableId:  _recived_data?.source.toString(),
                tgtTableId:  _recived_data?.target.toString(),
                srcTableColName: _recived_data?.sourceEndpoint.toString().replace('-right', '').replace('-left', ''),
                tgtTableColName: _recived_data?.sourceEndpoint.toString().replace('-left', '').replace('-right', ''),
                role_type: tables[source_index].node_type,
                connect_type: 'role'
              }
            }
            else{
              new_relation = {
                srcTableId:  _recived_data?.source.toString(),
                tgtTableId:  _recived_data?.target.toString(),
                srcTableColName: _recived_data?.sourceEndpoint.toString().replace('-right', ''),
                tgtTableColName: _recived_data?.targetEndpoint.toString().replace('-left', ''),
                role_type: tables[source_index].node_type,
                connect_type: 'role'
              }
            }            
          }          
        }
      }
      console.log(new_relation)
      relation.push(new_relation);
      window.localStorage.setItem('relations', JSON.stringify(relation));
           

      
      setTables([])
      setRelations([])
      
      
      setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));
      setRelations(_.cloneDeep(JSON.parse(window.localStorage.getItem('relations'))));

      setBoxId(boxId + 1);
    })

    window.addEventListener('remove_box', (e) => { 
      let load = true
      let tables = _.cloneDeep(_tables);
      if (JSON.parse(window.localStorage.getItem('tables'))){
        tables = _.cloneDeep(JSON.parse(window.localStorage.getItem('tables')));
      }
      const index = _.findIndex(tables, {id: e.detail.node_id});
      tables.splice(index, 1)
      window.localStorage.setItem('tables', JSON.stringify(tables));

      let relations = _.cloneDeep(_relations);
      if (JSON.parse(window.localStorage.getItem('relations'))){
        relations = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
      }

      
      const total = _.countBy(
        relations,
        ({ srcTableId }) => _.isEqual(srcTableId, e.detail.node_id) ? 'found' : 'not_found'
      );
      
      let i = 0;

      while(total.found > i){
        i++;
        // remove relations
        let last_table_id = -1;
        let srcTableColName = undefined;
        let relation = _.cloneDeep(_relations);
        if (JSON.parse(window.localStorage.getItem('relations'))){
          relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
        }
        const _relation_index = _.findIndex(relation, {srcTableId: e.detail.node_id})
        if (_relation_index != -1){
          last_table_id = relation[_relation_index]['tgtTableId'];
          srcTableColName = relation[_relation_index]['srcTableColName'];
          relation.splice(_relation_index, 1)
        }        
        window.localStorage.setItem('relations', JSON.stringify(relation));

        // remove all fields
        if (_relation_index != -1 && last_table_id != -1){
          let tables = _.cloneDeep(_tables);
          if (JSON.parse(window.localStorage.getItem('tables'))){
            tables = _.cloneDeep(JSON.parse(window.localStorage.getItem('tables')));
          }
          const index = _.findIndex(tables, {id: last_table_id});
          let old_table = tables[index];
          let fileds = old_table.fields;
          // by default
          const field_index = _.findIndex(fileds, {id: e.detail.node_id});
          fileds.splice(field_index, 1);

          if (srcTableColName!=undefined){
            const field_index = _.findIndex(fileds, {id: srcTableColName});
            if (field_index != -1){
              fileds.splice(field_index, 1);
            }            
          }

          old_table.fields = fileds;
          let new_table = old_table;
          tables.splice(index, 1, new_table);
          window.localStorage.setItem('tables', JSON.stringify(tables));

        }

      }

      setTables([]);
      setRelations([]);

      let relation = _.cloneDeep(_relations);
      if (JSON.parse(window.localStorage.getItem('relations'))){
        relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
      }
      
      setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));
      setRelations(relation);
      setRefresh(true);
      setOpen(true);
      setMessage('Node removed');
      
      window.localStorage.setItem('box_id', e.detail.node_id);
      setis_drawer_open(false)
    })

    window.addEventListener('remove_field', (e) => { 
      window.localStorage.setItem('box_id', e.detail.node_id);
      let tables = _.cloneDeep(_tables);
      if (JSON.parse(window.localStorage.getItem('tables'))){
        tables = _.cloneDeep(JSON.parse(window.localStorage.getItem('tables')));
      }
      const index = _.findIndex(tables, {id: e.detail.node_id});
      let old_table = tables[index];
      let fileds = old_table.fields;
      const field_index = _.findIndex(fileds, {id: e.detail.field.id});
      fileds.splice(field_index, 1)
      old_table.fields = fileds
      let new_table = old_table
      tables.splice(index, 1, new_table);

      let relation = _.cloneDeep(_relations);
      if (JSON.parse(window.localStorage.getItem('relations'))){
        relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
      }

      const _relation_index = _.findIndex(relation, {srcTableColName: e.detail.field.id})
      if (_relation_index != -1){
        relation.splice(relation, 1)
      }

      setTables([]);
      setRelations([]);
      setRefresh(true);

      window.localStorage.setItem('relations', JSON.stringify(relation));
      window.localStorage.setItem('tables', JSON.stringify(tables));
      setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables'))));
      setRelations(relation);
      setMessage('Role removed');
      setOpen(true);
      setis_drawer_open(false)
    })

    

    window.addEventListener('open_modal', (e) => { 
      const _offset = document.getElementsByClassName('butterfly-lineage-dag')[0].getBoundingClientRect()
      setAnchorEl2(nodeRef.current);
      setNodeDetails({left: e.detail.clientX - _offset.x, top: e.detail.clientY - _offset.y, detail: e.detail})
      // const boxID = window.localStorage.getItem('box_id') || 0;
      // if (!_.isEqual(boxID, e.detail.id)){
      //   setModalInfo(e.detail);
      //   setis_drawer_open(true);
      //   setis_modal_loading(true);
      //   setcenterId(e.detail.id)
      // }
      
    });

    
  }, []); // 

  useImperativeHandle(ref, () => ({

    save() {
      const tables = JSON.parse(window.localStorage.getItem('tables'))
      let relation = _.cloneDeep(_relations);
      if (JSON.parse(window.localStorage.getItem('relations'))){
        relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
      }
      let data = {tables: tables, relations: relation, roles: application?.lineage_data?.roleNodes};
      setOpen(true);
      setMessage('Saving ...');
      secureAxios.post(`${process.env.REACT_APP_SERVICE_PYTHON_API_URL}/lineage`, {lineage_data: JSON.stringify(data), workspace_id: workspace_id, lineage_id:lineage_id}).then((response) => {
        setOpen(true);
        setMessage('Save successfully');
      }).catch((error) => {
        setOpen(true);
        setMessage('Something went wrong');
      })
    },

    show_versions(){
      load_versions();
      setversion_drawer(true);
    }

  }));
  


  const actionMenu = []

  const onDragLeave = (e) => {
    e.preventDefault()
  }

  const onDrop = (data, e) => {
    
    const _offset = document.getElementsByClassName('butterfly-lineage-dag')[0].getBoundingClientRect()
    const id = data?.schema || data?.database || data?.tables;
    let tables = _.cloneDeep(_tables);
    if (JSON.parse(window.localStorage.getItem('tables'))){
      tables = _.cloneDeep(JSON.parse(window.localStorage.getItem('tables')));
    }

    let node_type = 'object';
    let allowed_lists = [];
    // console.log(props.selectedKey)

    if (props.selectedKey === 'objectNodes'){
      node_type = 'object';
      allowed_lists.push(_data[id]?.parent_id);
    }
    else if (props.selectedKey === 'roleNodes'){
      node_type = 'role'
    }
    else if(props.selectedKey === 'permissionNodes'){
      node_type = 'permissions'
    }
    else{
      allowed_lists = '*';
      node_type = 'user'
    }
   

    const obj_data = props?.objects[props.selectedKey][id]
    if (node_type === 'user'){
      const index = _.findIndex(tables, {node_type: 'user'})
      if (index == -1){
        let node1 = {
          id: 'user1',
          name: 'Users',
          _left: e.clientX - (canvas._coordinateService.canOffsetX+_offset.left) -5,
          _top: e.clientY - (canvas._coordinateService.canOffsetY+_offset.top) -5,
          node_type: node_type,
          is_collpase: false,
          allowed_lists: allowed_lists,
          parent_id: -1,
          object_type: obj_data.object_type,
          is_group: true,
          fields: [{
            id: id,
            title: obj_data?.text,
          }]
        };
        tables.push(node1);
        window.localStorage.setItem('tables', JSON.stringify(tables));
        setTables(tables); 
      }
      else{
        let old_table = tables[index];
        old_table.fields.push({
          id: id,
          title: obj_data?.text,
        });

        let new_table = old_table
        // console.log(new_table)
        tables.splice(index, 1, new_table);
        setTables([]);
        setRelations([]);

        setTimeout(()=>{
          window.localStorage.setItem('tables', JSON.stringify(tables));
          setTables(_.cloneDeep(JSON.parse(window.localStorage.getItem('tables')))); 
          let relation = _.cloneDeep(_relations);
          if (JSON.parse(window.localStorage.getItem('relations'))){
            relation = _.cloneDeep(JSON.parse(window.localStorage.getItem('relations')));
          }
          window.localStorage.setItem('relations', JSON.stringify(relation));
          setRelations(relation);
        }, 0);
      }
    }
    else{
      // console.log('allowed_lists', allowed_lists)
      let node1 = {
        id: id,
        name: obj_data.text,
        _left: e.clientX - (canvas._coordinateService.canOffsetX+_offset.left) -5,
        _top: e.clientY - (canvas._coordinateService.canOffsetY+_offset.top) -5,
        fields: [],
        node_type: node_type,
        is_collpase: false,
        allowed_lists: allowed_lists,
        parent_id: obj_data.parent_id,
        object_type: obj_data.object_type
      };
      tables.push(node1);
      window.localStorage.setItem('tables', JSON.stringify(tables));
      setTables(tables);  
    }
      
  }

  const action = (
    <Fragment>
      <IconButton
        aria-label="close"
        color="inherit"
        onClick={handleClose}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  

  const drawerWidth = 240;

  const Drawer_box = () => {
    let closeImg = {cursor:'pointer', border: '0.2px solid #ebecec', background: '#fff', borderRadius: '0%', position:'absolute', marginTop: '10px', right: '8px', width: '20px', 'height': '20px'};

    return (
      <div
        className="right_box"
        style={is_drawer_open ? {right: '0px'} : {right: '-300px'}}
      >
        <>
          <IconButton
            onClick={() => setis_drawer_open(false)}
            style={closeImg}
          >
            
            <KeyboardDoubleArrowRightOutlinedIcon style={{width: '15px', height: '15px'}}/>
          </IconButton>
        </>

        <LinkModal data={dialogData} role_details={role_details} checked={checked} handleCheck={handleCheck}/>
        
        {is_modal_loading &&
          <div style={{display: 'flex', justifyContent: 'center', marginTop: '47%'}}>
            {/* <CircularProgress style={{'color': '#1976d2'}}/> */}
          </div>}
      </div>
    )
  }

  const list = () => {
    // const versions =  load_versions()
    return(
      <Box
        role="presentation"
        sx={{ width: 250 }}
      >
      
        <Divider />
        {is_modal_loading && 
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '47%'}}>
          <CircularProgress style={{'color': '#1976d2'}}/>
        </div>
        }
        {version_list.length > 0 && <List>
          {version_list.map((item, index) => (
            <ListItem
              disablePadding
              key={index}
            >
              <ListItemButton
                onClick={() => {
                  toggleDrawer(false);
                  set_lineage(item.lineage_data, item.version, item.created_timestamp);
                  setOpen(true);
                  setMessage('Lineage Updated to #'+item.version);}}
              >
                <ListItemIcon>
                  <WorkHistoryOutlinedIcon/>
                </ListItemIcon>
                <ListItemText 
                  primary={'Version - #'+item.version} 
                  secondary={moment(item.created_timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  secondaryTypographyProps={{ style: {fontSize: '10px'}}}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>}
        {version_list.length == 0 && <div style={{display: 'flex', justifyContent: 'center', marginTop: '47%'}}>
          <Typography
            align="center"
            component="h2"
            variant="caption"
          >No history found</Typography> 
        </div>}
      </Box>)
  };


  const connection_menu = () => {
    return (
      <Menu
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        anchorEl={anchorEl}        
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        id="account-menu"
        onClick={handleCloseLineMenu}
        onClose={handleCloseLineMenu}
        open={Boolean(anchorEl)}
        ref={anchorRef}
        style={{padding: 0}}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem
          className="menu_line"
          dense={false}
          disableGutters
          disableRipple
          selected
        >
          <Box
            style={{maxWidth: '250px'}}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              '& > :not(style)': {
                m: 0,
              },
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
          >
            <Paper
              elevation={0}
              style={{margin: '5px', padding: '0px 5px'}}
            >
              <Grid
                container
                spacing={0}
              >
                <Grid
                  item
                  xs={12}
                >
                  <Typography
                    style={{margin: '0px 0px 2px', color: "#494949"}}
                    variant="subtitle2"
                  >Details</Typography>
                </Grid>
                
                {propertyData && propertyData.map((item, index) => {
                  return (
                    <Grid
                      item
                      key={index}
                      xs={12}
                    >
                      <Typography
                        style={{ fontSize: '0.75rem' }}
                        variant="caption"
                      >{item.type}: {item.value}</Typography>
                    </Grid>
                  )
                })}
                
                
              </Grid>
              <Divider style={{margin: '5px'}}/>
              <Grid
                container
                spacing={0}
              >
                <Grid
                  item
                  xs={12}
                >
                  <Typography
                    style={{margin: '5px 0px', color: "#494949"}}
                    variant="subtitle2"
                  >Permissions</Typography>
                </Grid>
                <Grid
                  container
                  item 
                >
                  {role_details?.permissions.map((item, index) => {
                    const labelId = `checkbox-list-label-${index}`;
                    if (index === 0){
                      return null
                    }
                    return(
                      <List
                        dense
                        key={index}
                      >
                        <ListItemButton
                          dense
                          role={undefined}
                          style={{maxHeight: '30px', minWidth: '115px'}}
                        >
                          <ListItemIcon>
                            <Checkbox
                              checked={checked[item?.id] || false}
                              disableRipple
                              edge="start"
                              inputProps={{ 'aria-labelledby': labelId }}
                              onChange={(event) => {handleCheck(event, item?.id, role_details?.options)}}
                              tabIndex={-1}
                            />
                          </ListItemIcon>
                          <ListItemText
                            id={labelId}
                            primary={item?.text}
                          />
                        </ListItemButton>
                      </List>
                    )
                  })}

                </Grid>
              </Grid>

              <Divider style={{margin: '5px'}}/>
              
              <Grid
                container
                spacing={0}
              >

                <List
                  dense
                  style={{minWidth: '100%'}}
                >

                  <ListItem 
                    dense
                    style={{padding: '0px'}}
                  >
                    <Button
                      onClick={() => handleRemoveLine(role_details?.options)}
                      style={{minWidth: '100%', borderColor: '#ebecec', color: '#000'}}
                      variant="outlined"
                    >Delete</Button>

                  </ListItem>

                  <ListItem 
                    dense
                    style={{padding: '0px', margin: '5px 0px'}}
                  >
                    <Button
                      style={{minWidth: '100%', borderColor: '#ebecec', color: '#000'}}
                      variant="outlined"
                      onClick={()=> setis_drawer_open(true)}
                    >Properties</Button>

                  </ListItem>

                </List>

              </Grid>
          

              
            </Paper>
          </Box>
        </MenuItem>
        
      </Menu>
    )
  }


  const node_menu = () => {
    return (
      <Menu
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        anchorEl={anchorEl2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        aria-labelledby="demo-positioned-button"
        id="demo-positioned-menu"
        onClose={handleCloseNodeMenu}
        open={Boolean(anchorEl2)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem onClick={() => {handleOpenNodeProperty(node_details?.detail?.options); handleCloseNodeMenu()}}>Properties</MenuItem>
        <MenuItem onClick={handleCloseNodeMenu}>Delete</MenuItem>
      </Menu>
    )
  }

  const delete_confirm = () => {
    return(
      <Dialog 
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        onClose={handleCloseDialogConfirm}
        open={deletedialogConfirmOpen}
      >
        <DialogTitle>Alert</DialogTitle>
        <DialogContent>
          <DialogContentText>
              Confirm the delete by entering the delete me.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            id="name"
            margin="dense"
            onChange={(event) => setConfirmDelete(event.target.value)}
            type="text"
            value={confirm_delete}
            variant="standard"
          />
          {msg2 && <Typography
            color="#ff3333"
            component="h2"
            variant="subtitle1"
                   >{msg2}</Typography>}
        </DialogContent>        
        <DialogActions>
          <Button
            onClick={handleCloseDialogConfirm}
            style={{backgroundColor: grey[500]}}
            variant="contained"
          >
                Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleExecuteDelete}
            startIcon={<DeleteOutlinedIcon />}
            variant="contained"
          >
                Delete
          </Button>         
        </DialogActions>
      </Dialog> 
    )
  }


  return (
    <Droppable
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden'}}
      types={['schema', 'database', 'tables']}
    >   
      {/* <button onClick={savebutton}>Save</button> */}

      <div className="lineage_search">
        <div className="search">
          <input
            placeholder="Search object..."
            type="text"
          />
          <SearchIcon className="icon" />
        </div>
        <ActionMenu 
          actionMenu={[]}
          canvas={canvas}
          visible={true}
        />
      </div>

      {is_drawer_open && 
      <OutsideClickHandler
        onOutsideClick={() => setis_drawer_open(false)}
      > <Drawer_box/> </OutsideClickHandler>}

      
      <Drawer
        anchor={'right'}
        onClose={toggleDrawer(false)}
        open={version_drawer}
      >
        {list('right')}
      </Drawer>

      {connection_menu()}
      {node_menu()}
      {delete_confirm()}

      <Tooltip title={role_details?.name}>
        <div
          onClick={handleOpenLineMenu}
          style={{left: role_details?.left -5, top: role_details?.top - 5, position: 'absolute', cursor: 'pointer', width: '10px', height: '10px', 'background': 'transparent', zIndex: 10000}}
        />
      </Tooltip>

      <div 
        ref={nodeRef}
        style={{left: node_details?.left + 10, top: node_details?.top, position: 'absolute', cursor: 'pointer', width: '5px', height: '10px', 'background': 'transparent', zIndex: 10000}}
      />

      {is_loaded && <LineageDag
        actionMenu={actionMenu}
        boxId={boxId}
        columns={columns}
        config={{
          titleRender: (title, node) => {
            return <div className="title-test">{title}</div>
          },
          minimap: {
            enable: false
          }
        }}
        onLoaded={(canvas) => {
          setCanvas(canvas)
        }}
        operator={operator}
        refresh={_refresh}
        relations={_relations}
        roles={all_roles}
        tables={_tables}
                    /> }
      <Snackbar
        action={action}
        autoHideDuration={6000}
        message={msg}
        onClose={handleClose}
        open={open}
      />
    </Droppable>)
});

export default memo(Lineage)
