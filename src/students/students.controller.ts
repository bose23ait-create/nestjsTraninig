import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { StudentsService } from './students.service';
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}

@Get()
async getAllStudents() {
    return this.studentsService.getAllStudents();
}
 @Post()
  async createStudent(@Body() studentData: any) {
    return this.studentsService.cretateStduent(studentData);
  }
  
  @Put(':id')
  async updateStudent(@Param('id') id: string, @Body() studentData: any) {
    return this.studentsService.updateStudent(id, studentData);
  }

  @Delete(':id')
  async deleteStudent(@Param('id') id: string){
    return this.studentsService.deleteStudent(id);
  }

}
