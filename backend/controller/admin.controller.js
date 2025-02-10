const {Op} = require('sequelize');
const Group = require('../models/group.model')
const User = require('../models/user.model')
const Member = require('../models/member.model')

exports.removeMember = async(req,res)=>{
    try{
        const groups = await req.user.getGroups({where : {id : req.params.groupId}})
        const member = groups[0].member

        const groupId = req.params.groupId;
        const userId = req.body.userId;
        if(member.admin){

        
        const members = await groups[0].getUsers({
            where :{
               id : userId
            }
        })
        if(members.length == 1)
        {
            const user = members[0].member
            if(user.creator){
                return res.status(403).json({msg:"You don't have permission"})
            }else{

                await user.destroy()
                return res.json({success : true , msg:"User removed"})
            }
        }else{
            return res.status(404).json({msg:"User does not exist"})
        }    
        
    }else{
        return res.status(403).json({msg:"You don't have permission"})
    }
    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg :"Internal server error"})
    }
}

exports.makeAdmin = async(req,res)=>{
changeAdmin(true ,req,res)
}

exports.removeAdmin = async(req,res)=>{
changeAdmin(false , req,res)
}

async function changeAdmin(value , req,res){
    try{
        const groups = await req.user.getGroups({where : {id : req.params.groupId}})
        const member = groups[0].member

        const groupId = req.params.groupId;
        const userId = req.body.userId;
        if(member.admin){

        
        const members = await groups[0].getUsers({
            where :{
               id : userId
            }
        })
        if(members.length == 1)
        {
            const user = members[0].member
            

                user.admin = value
                await user.save()
                let msg;
                if(value)
                    msg ="User promoted to admin"
                else
                    msg ="Admin status removed from user"
                return res.json({success : true , msg})
            
        }else{
            return res.status(404).json({msg:"User does not exist"})
        }    
        
    }else{
        return res.status(403).json({msg:"You don't have permission"})
    }
    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg :"Internal server error"})
    }
}

exports.showUser = async(req,res)=>{
    try{
        const groups = await req.user.getGroups({where : {id : req.params.groupId}})
        // const currentUsers = await group[0]
        const group = groups[0]
        const member = group.member
        const users = await group.getUsers()
        const usersId = users.map(user => user.id)
        if(member.admin){
            const result = await User.findAll({
                where :{
                    id :{
                        [Op.notIn] : usersId
                    }
                },
                attributes : {
                    exclude : ['password']
                }
            })
            return res.json(result)
        }else{
            return res.json({msg :"You don't have the required permissions"})
        }
        

    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg :"Internal server error"})
    }
}

// exports.addUser = async(req,res)=>{
//     try{
//         const groupId = req.params.groupId;
//         const groups = await req.user.getGroups({where : {id : groupId}})
//         const group = groups[0]
//         const member = group.member
//         const id = req.body.id
//         if(member.admin){
//             const user = await User.findByPk(id)
//             const newUser = await group.addUser(user)
//             return res.json({user : newUser , msg :"New User added successfully"})
//         }else{
//             return res.json({msg :"You don't have the required permissions"})
//         }
//     }catch(e){
//         console.log(e)
//         return res.status(500).json({success : false , msg :"Internal server error"})
//     }
// }

exports.addUser = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const groups = await req.user.getGroups({ where: { id: groupId } });
        const group = groups[0];
        const member = group.member;
        const id = req.body.id;

        if (member.admin) {
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ msg: "User not found" });
            }

            // Add the user to the group
            await group.addUser(user);

            // Return the complete user details
            return res.json({ 
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                }, 
                msg: "New User added successfully" 
            });
        } else {
            return res.status(403).json({ msg: "You don't have the required permissions" });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};
