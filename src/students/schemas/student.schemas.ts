import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose'

@Schema()
export class Student{
    @Prop({ required: true })
    name!:string;

    @Prop({ required: true })
    age!:number;

    @Prop({ required: true })
    email!:string;
}
export const StudentSchema=SchemaFactory.createForClass(Student)