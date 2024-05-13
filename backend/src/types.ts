import zod from "zod" ;

export const createTaskInput = zod.object({

    title : zod.string().optional() ,

    options : zod.array(zod.object({
        imageUrl : zod.string()
    })) ,

    signature : zod.string()

})