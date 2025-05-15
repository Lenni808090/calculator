use std::cmp::PartialEq;
use crate::calculator::lexer::{Token, Tokentype};
#[derive(Debug)]
pub enum Expr{
    BinaryExpr{
        left: Box<Expr>,
        operator: String,
        right: Box<Expr>,
    },
    Number(f64),
}

pub struct Parser{
    pub tokens: Vec<Token>,
}

impl Parser{
    pub fn new(tokens: Vec<Token>) -> Parser{
        Parser{
            tokens,
        }
    }

    fn expect(&mut self,exptToken:Tokentype, msg: &str) -> Token{
        let token = self.eat();
        if token.token_type != exptToken{
            panic!("{}", msg)
        }
        token
    }

    fn eat(&mut self) -> Token{
        self.tokens.remove(0)
    }

    fn at(&mut self) -> &Token{
        self.tokens.first().expect("Kein Token verfügbar")
    }


    fn not_eof(&self) -> bool {
        if let Some(token) = self.tokens.first() {
            token.token_type != Tokentype::EoF
        } else {
            false
        }
    }

    pub fn parse(&mut self) -> Expr{
        self.parse_additive_expr()
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
        let token = self.at();

        match token.token_type {
            Tokentype::Number => {
                let number = Expr::Number(token.value.parse::<f64>().unwrap());
                self.eat();
                number            }
            Tokentype::OpenParen => {
                self.expect(Tokentype::OpenParen, "Expected Open Paren");
                let expr= self.parse_additive_expr();
                self.expect(Tokentype::CloseParen,"expected close Paren after opening one");
                expr
            }
            _ => {
                panic!("Unerwarteter Token im primary");
            }
        }

    }
}









































