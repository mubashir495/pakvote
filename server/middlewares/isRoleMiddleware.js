
export const partyOnly = (req, res, next) => {
  if (req.user.role !== "party") {
    return res.status(403).json({
      success: false,
      message: "party access only",
    });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "party access only",
    });
  }
  next();
};

export const candidateOnly = (req,res,next)=>{
if(req.user.role !== "candidate"){
    return res.status(403).json({
        success:false,
        message:"party access only"
    })
}
next()
}
