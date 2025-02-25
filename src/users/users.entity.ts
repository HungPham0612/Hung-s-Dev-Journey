import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstname!: string;

  @Column()
  lastname!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true, type: 'varchar' })
  resetToken?: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpiresAt?: Date | null;

  @Column({default: true})
  isActive: boolean = true;
}
