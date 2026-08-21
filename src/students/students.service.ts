import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from './schemas/student.schemas';

@Injectable()
export class StudentsService {
    constructor(@InjectModel(Student.name) private studentModel: Model<Student>) {}

    async cretateStduent(student: Student): Promise<Student> {
        const newStudent = new this.studentModel(student);
        return newStudent.save();
    }

    async getAllStudents(): Promise<Student[]> {
        return this.studentModel.find().exec();
    }

    async updateStudent(id: string, student: Student): Promise<Student | null> {
        return this.studentModel.findByIdAndUpdate(id, student, { new: true });
    }

    async deleteStudent(id: string): Promise<Student | null> {
        return this.studentModel.findByIdAndDelete(id);
    }

}
