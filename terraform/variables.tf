variable "db_username" {
  type    = string
  default = "fishadmin"
}

variable "db_password" {
  type      = string
  sensitive = true
}