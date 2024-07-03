import { IsString, IsEmail, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { NoteTypes } from '../enums/note-types.enum';

export class AddNoteDto {

  @IsEnum(NoteTypes)
  public type: NoteTypes;

  @IsString()
  public note: string;
}
