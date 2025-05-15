use crate::calculator::parser::Expr;

pub fn calculate(abs:Expr) -> f64{
    calculate_expr(&abs)
}


fn calculate_expr(expr:&Expr) -> f64{
    match expr{
        Expr::BinaryExpr {
            left, operator,right
        } => {
            calculate_binary_expr()
        }

        Expr::Number(val) => {
            *val
        }

        _ => {
            panic!("Unkown Expression")
        }
    }
}




fn calculate_binary_expr()