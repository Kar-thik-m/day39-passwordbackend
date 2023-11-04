import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: {
        type: 'string',
        require: true,
    },
    name: {
        type: 'string',
        require: true,
    },
    dob: {
        type: 'string',
        require: true,
    },
    imageUrl:{
        type:'string',
        require: true,
    }
});

const appUserSchema=new mongoose.Schema({
    id: {
        type: 'string',
        require: true,
    },
    Name: {
        type: 'string',
        require: true,
    },
   
   email:{
        type:'string',
        require: true,
    },
    password:{
        
        type:'string',
        require: true,
    },
    ResetKey:{
        type:'string',
        require: true,
    }
});

export const user = mongoose.model('users',userSchema);
export const AppUserModel = mongoose.model('app-users ',appUserSchema);