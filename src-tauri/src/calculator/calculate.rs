use crate::calculator::lexer::Tokentype::Operator;
use crate::calculator::parser::Expr;

pub fn calculate(abs:&Expr) -> f64{
    calculate_expr(&abs)
}


fn calculate_expr(expr:&Expr) -> f64{
    match expr{
        Expr::BinaryExpr {
            left, operator,right
        } => {
            calculate_binary_expr(&**left, &**right, operator)
        }

        Expr::Number(val) => {
            *val
        }

        _ => {
            panic!("Unkown Expression")
        }
    }
}




fn calculate_binary_expr(left: &Expr, right: &Expr, operator: &String) -> f64 {
    let right_val = calculate_expr(&right);
    let left_val = calculate_expr(&left);

    match operator.as_str() {
        "+" =>{
            left_val + right_val
        }

        "-" => {
            left_val - right_val
        }
        "/" => {
            left_val / right_val
        }
        "*" => {
            left_val * right_val
        }
        _ => {
            panic!("Unkown Operator");
        }
    }
}