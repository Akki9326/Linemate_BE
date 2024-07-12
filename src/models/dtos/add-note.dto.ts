import { IsString } from 'class-validator';
// import { NoteTypes } from '../enums/note-types.enum';

export class AddNoteDto {
	@IsString()
	public type: string;

	@IsString()
	public note: string;
}
