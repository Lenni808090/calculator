use crate::calculator::lexer::{Token, Tokentype};

pub enum Expr{
    BinaryExpr{
        left: Box<Expr>,
        operator: String,
        right: Box<Expr>,
    },
    Number(f64),
}

pub struct Parser{
    tokens: Vec<Token>,
}

impl Parser{
    pub fn new(tokens: Vec<Token>) -> Parser{
        Parser{
            tokens,
        }
    }

    fn eat(&mut self) -> Token{
        self.tokens.remove(0)
    }

    fn at(&mut self) -> &Token{
        self.tokens.first().expect("Kein Token verfügbar")
    }

    pub fn parse(&mut self){
            self.parse_additive_expr();
    }


    fn parse_additive_expr(&mut self) -> Expr{

        let mut left = self.parse_multiplicitive_expr();
        let token = self.at();
        while ["+", "-"].contains(&self.at().value.as_str()){
            let operator = self.eat().value;
            let right = self.parse_multiplicitive_expr();
            left = Expr::BinaryExpr {
                left: Box::new(left),
                operator,
                right: Box::new(right),
            };
        }

        left
    }



    fn parse_multiplicitive_expr(&mut self) -> Expr{
        let mut left = self.parse_primary_expr();
        
        let token = self.at();
        while ["*", "/"].contains(&self.at().value.as_str()) {
            let operator = self.eat().value;
            let right = self.parse_primary_expr();
            left = Expr::BinaryExpr {
                left: Box::new(left),
                operator,
                right: Box::new(right)
            }
        }
        
        
        left
    }



    fn parse_primary_expr(&mut self) -> Expr{
        let token = self.eat();

        match token.token_type {
            Tokentype::Number => {
                Expr::Number(token.value.parse::<f64>().unwrap())
            }
            _ => {
                panic!("Unerwarteter Token im primary");
            }
        }

    }
}









































