const logger={

    info:(msg)=>{

        console.log("✅",msg);

    },

    error:(msg)=>{

        console.error("❌",msg);

    },

    warn:(msg)=>{

        console.warn("⚠️",msg);

    }

};

module.exports=logger;