terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.0" }
  }
}
provider "aws" { region = "us-east-1" }
variable "stack_name" { type = string }
variable "parameters" { type = map(string) }
resource "aws_cloudformation_stack" "laboratorio" {
  name = var.stack_name
  template_body = file("${path.module}/laboratorio.json")
  parameters = var.parameters
  capabilities = ["CAPABILITY_IAM"]
  lifecycle { prevent_destroy = true }
  tags = { ManagedBy = "practicas-ht01-ht05", Project = var.parameters["Project"] }
}
output "outputs" { value = aws_cloudformation_stack.laboratorio.outputs }
