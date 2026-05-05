module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"

  name = "fishing-game-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  enable_dns_hostnames = true
}

resource "aws_security_group" "rds_sg" {
  name        = "fishing-game-rds-sg"
  description = "Allow MySQL access from inside VPC"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "MySQL from VPC"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "rds_subnets" {
  name       = "fishing-game-rds-subnets"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_db_instance" "mysql" {
  identifier             = "fishing-game-mysql"
  engine                 = "mysql"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = "fishing_game"
  username               = var.db_username
  password               = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.rds_subnets.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  publicly_accessible    = false
  skip_final_snapshot    = true
  deletion_protection    = false
}